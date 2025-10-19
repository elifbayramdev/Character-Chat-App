'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";

interface Character {
  id: string;
  name: string;
  avatar_url: string;
  description?: string;
}

function ShimmerCard() {
  return (
    <Card className="bg-[#1B3C53] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center animate-pulse">
      <div className="mb-4 w-24 h-24 bg-gray-700 rounded-full"></div>
      <div className="h-5 w-20 bg-gray-700 rounded mb-2"></div>
      <div className="h-3 w-32 bg-gray-700 rounded"></div>
    </Card>
  );
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCharacters() {
      const { data, error } = await supabase.from("characters").select("*");
      if (error) console.error(error);
      if (data) setCharacters(data);
    }
    fetchCharacters();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#456882] text-white">
      <div className="flex-1 overflow-y-auto p-6 gap-6 mb-24">
        <h2 className="text-4xl font-bold text-[#D1D3D4] mb-4 items-center flex justify-center">
          Characters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {characters
            ? characters.map((char) => (
                <Card
                  key={char.id}
                  className="cursor-pointer bg-[#1B3C53] hover:bg-[#234C6A] transition-transform transform hover:scale-105 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center"
                  onClick={() => router.push(`/chat/${char.id}`)}
                >
                  <Avatar className="mb-4 w-24 h-24">
                    <AvatarImage src={char.avatar_url} className="rounded-full" />
                    <AvatarFallback className="text-2xl font-bold">
                      {char.name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="font-semibold text-xl text-white">{char.name}</div>
                  {char.description && (
                    <div className="text-gray-400 text-sm mt-2 line-clamp-2">
                      {char.description}
                    </div>
                  )}
                </Card>
              ))
            : // Show 6 shimmer cards while loading
              Array.from({ length: 6 }).map((_, i) => <ShimmerCard key={i} />)}
        </div>
      </div>
      <div className="flex-shrink-0">
        <BottomNav />
      </div>
    </div>
  );
}
