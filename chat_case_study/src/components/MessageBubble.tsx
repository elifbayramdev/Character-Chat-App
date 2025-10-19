export default function MessageBubble({ message }: { message: { sender: string; text: string } }) {
  const isUser = message.sender === "user";
  return (
    <div className={`max-w-[80%] p-3 rounded-xl ${isUser ? "bg-[#1B3C53] text-white ml-auto" : "bg-[#D2C1B6] text-black mr-auto"}`}>
      {message.text}
    </div>
  );
}
