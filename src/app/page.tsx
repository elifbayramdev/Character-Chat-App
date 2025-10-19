'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace('/chat');
  }, [user, loading, router]);

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
                redirectTo: `${window.location.origin}/chat`
      },
    });
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-semibold mb-4">Welcome — Sign in</h1>
        <Button onClick={signInWithGoogle} className="w-full h-12">
          Continue with Google
        </Button>
      </div>
    </main>
  );
}
