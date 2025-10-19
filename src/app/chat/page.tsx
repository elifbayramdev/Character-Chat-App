'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/context/AuthProvider";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; 
import { Card, CardContent } from "@/components/ui/card";

interface Character {
  id: string;
  name: string;
  avatar_url: string;
  description?: string;
}

interface Chat {
  id: string;
  character: Character;
  last_message: string;
  created_at: string;
}

export default function ChatListPage() {
  const { user, loading: authLoading } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (window.location.hash.includes("access_token")) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
      );
    }
  }, []);

  useEffect(() => {
    if (!user || authLoading) return;

    async function fetchData() {
      // Characters
      const { data: charData, error: charError } = await supabase
        .from("characters")
        .select("*");
      if (charError) console.error(charError);
      if (charData) setCharacters(charData);

      // Chats
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select(`
          id,
          character:characters(id, name, avatar_url),
          messages:messages(text, created_at),
          created_at
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (chatError) console.error(chatError);

      if (chatData) {
        setChats(
          chatData.map((c: any) => ({
            id: c.id,
            character: c.character,
            last_message:
              c.messages && c.messages.length > 0
                ? c.messages[c.messages.length - 1].text
                : "No messages yet",
            created_at: c.created_at,
          }))
        );
      }

      setLoading(false);
    }

    fetchData();

    const channel = supabase
      .channel("messages-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, authLoading]);

if (authLoading || loading) {
  return (
    <div className="flex flex-col h-screen bg-[#456882] text-white p-6">
      {/* Header shimmer */}
      <div className="h-10 w-40 bg-gray-700 rounded mb-6 animate-pulse mx-auto"></div>

      {/* Chat list shimmer */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 bg-[#1B3C53] rounded-xl p-4 animate-pulse"
          >
            {/* Avatar */}
            <div className="w-14 h-14 bg-gray-700 rounded-full"></div>

            {/* Name and last message */}
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-gray-700 rounded"></div>
              <div className="h-4 w-full bg-gray-600 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* BottomNav shimmer placeholder */}
      <div className="fixed bottom-0 left-0 w-full z-50 h-16 bg-[#234C6A] animate-pulse"></div>
    </div>
  );
}


  return (
    <div className="flex flex-col h-screen bg-[#456882] text-white">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 mb-24">
            {chats.length > 0 && (
            <>
                <h2 className="text-4xl font-bold text-[#D1D3D4] mb-4 items-center flex justify-center">Chats</h2>
                <div className="flex flex-col gap-4">
                {chats.map((chat) => (
                    <Card
                    key={chat.id}
                    className="cursor-pointer bg-[#1B3C53] hover:bg-[#234C6A] transition-transform rounded-xl shadow-md"
                    onClick={() => router.push(`/chat/${chat.character.id}`)}
                    >
                    <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="w-14 h-14">
                        <AvatarImage
                            src={chat.character.avatar_url}
                            className="rounded-full"
                        />
                        <AvatarFallback className="text-lg">
                            {chat.character.name[0]}
                        </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                        <div className="font-semibold text-lg">{chat.character.name}</div>
                        <div className="text-gray-400 text-sm line-clamp-2">
                            {chat.last_message.length > 100
                            ? chat.last_message.slice(0, 100) + "..."
                            : chat.last_message}
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </>
            )}
        </div>

        <div className="fixed bottom-0 left-0 w-full z-50">
            <BottomNav />
        </div>
    </div>
  );
}
