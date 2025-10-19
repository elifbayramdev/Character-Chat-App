"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-2 border-t border-[#1B3C53]">
      <input
        type="text"
        className="flex-1 border border-[#1B3C53] rounded-xl px-4 py-2 focus:outline-none bg-[#234C6A] text-white"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        className=" hover:bg-[#1B3C53] w-12 h-12 rounded-full border border-[#1B3C53] flex items-center justify-center shadow-lg transition-all ml-2 px-2 py-2"
      >
        <Send className="text-white rotate-45" />
      </button>
    </form>
  );
}
