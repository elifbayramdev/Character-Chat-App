'use client';
import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getAIResponse } from "@/lib/groq";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";
import { useAuth } from "@/context/AuthProvider";
import { ChevronLeft } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "character";
  text: string;
  created_at: string;
}

interface Character {
  id: string;
  name: string;
  avatar_url: string;
  conversation_style: string;
}

export default function ChatPageWrapper() {
  const pathname = usePathname(); // /chat/<characterId>
  const parts = pathname.split("/");
  const characterId = parts[2];

  return <ChatPage characterId={characterId} />;
}

interface ChatPageProps {
  characterId: string;
}

export function ChatPage({ characterId }: ChatPageProps) {
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const userId = user?.id;

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // Fetch character
  useEffect(() => {
    async function fetchCharacter() {
      if (!characterId) return;
      const { data, error } = await supabase
        .from("characters")
        .select("*")
        .eq("id", characterId)
        .single();
      if (error) {
        console.error("Fetch character failed:", error);
        return;
      }
      setCharacter(data);
    }
    fetchCharacter();
  }, [characterId]);

  // Create or fetch chat
  useEffect(() => {
    if (!userId || !characterId) return;

    async function createChatIfNotExist() {
      const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("user_id", userId)
        .eq("character_id", characterId)
        .order("created_at", { ascending: true })
        .limit(1); // Take only the first chat

      if (error) {
        console.error("Fetch chat failed:", error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        setChatId(data[0].id);
        fetchMessages(data[0].id);
      } else {
        const { data: newChat, error: insertError } = await supabase
          .from("chats")
          .insert({ user_id: userId, character_id: characterId })
          .select()
          .single();

        if (insertError) {
          console.error("Insert chat failed:", insertError);
          setLoading(false);
          return;
        }

        setChatId(newChat.id);
        setMessages([]);
      }

      setLoading(false);
    }

    createChatIfNotExist();
  }, [userId, characterId]);

  // Fetch messages
  const fetchMessages = async (cId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", cId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fetch messages failed:", error);
      return;
    }
    if (data) setMessages(data as Message[]);
  };

  // Realtime subscription
  useEffect(() => {
    if (!chatId) return;

    const channel = supabase
      .channel(`chat-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.new) setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Send message
  const handleSend = async (text: string) => {
    if (!chatId || !userId || !text.trim()) return;

    // Insert user message
    const { data: userMsg, error: userError } = await supabase
      .from("messages")
      .insert({ chat_id: chatId, sender: "user", text })
      .select()
      .single();

    if (userError) {
      console.error("Insert user message failed:", userError);
      return;
    }
    setMessages((prev) => [...prev, userMsg as Message]);

    setIsTyping(true);

    // Get AI response
    const prompt = `You are a helpful AI character. Respond in a ${character?.conversation_style ?? "friendly"} style. User says: "${text}"\nAI:`;
    const aiText = await getAIResponse(prompt);

    setIsTyping(false);

    if (!aiText) return;

    // Insert AI message
    const { data: aiMsg, error: aiError } = await supabase
      .from("messages")
      .insert({ chat_id: chatId, sender: "character", text: aiText })
      .select()
      .single();

    if (aiError) {
      console.error("Insert AI message failed:", aiError);
      return;
    }
    setMessages((prev) => [...prev, aiMsg as Message]);
  };

if (authLoading || loading || !character) {
  return (
    <div className="flex flex-col h-screen bg-[#456882] p-4">
      {/* Top Bar Shimmer */}
      <div className="flex items-center px-4 py-2 border-b border-[#842A3B] bg-[#A3485A] shadow-sm animate-pulse">
        <div className="w-6 h-6 bg-gray-400 rounded-full mr-3"></div>
        <div className="w-10 h-10 bg-gray-400 rounded-full mr-3"></div>
        <div className="h-5 w-32 bg-gray-400 rounded"></div>
      </div>

      {/* Messages Shimmer */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex ${
              i % 2 === 0 ? "justify-start" : "justify-end"
            } animate-pulse`}
          >
            <div className="max-w-[60%] h-12 bg-gray-700 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Input Shimmer */}
      <div className="h-12 bg-gray-700 rounded-lg mt-2 animate-pulse px-4"></div>
    </div>
  );
}


  return (
    <div className="flex flex-col h-screen bg-[#456882]">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-2 border-b border-[#842A3B] bg-[#A3485A] shadow-sm">
        <button
        onClick={() => router.back()}
        className="mr-3 text-[#F5DAA7] hover:text-gray-900 flex items-center"
        >
        <ChevronLeft className="w-6 h-6" />
        </button>
        {character?.avatar_url && (
          <img
            src={character.avatar_url}
            alt={character.name}
            className="w-10 h-10 rounded-full mr-3"
          />
        )}
        <h1 className="text-lg font-semibold text-[#F5DAA7]">{character?.name}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4" ref={scrollRef}>
        <MessageList messages={messages} />
        {isTyping && <div className="text-gray-500 italic ml-2 mb-2">AI is typing...</div>}
      </div>

      {/* Message Input */}
      <MessageInput onSend={handleSend} />
    </div>
  );
}
