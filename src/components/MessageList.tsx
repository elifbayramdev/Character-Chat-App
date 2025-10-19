"use client";

import { motion } from "framer-motion";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  sender: "user" | "character";
  text: string;
}

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col gap-2 py-4">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <MessageBubble message={msg} />
        </motion.div>
      ))}
    </div>
  );
}
