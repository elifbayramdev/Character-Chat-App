export default function ChatListItem({ chat }: any) {
  return (
    <div className="flex items-center gap-3 p-3 border-b hover:bg-gray-50">
      <img src={chat.character.avatar_url} className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <div className="font-semibold">{chat.character.name}</div>
        <div className="text-sm text-gray-500 truncate">{chat.last_message}</div>
      </div>
    </div>
  );
}
