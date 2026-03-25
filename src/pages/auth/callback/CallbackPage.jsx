'use client';

import { useEffect } from 'react';

export default function CallbackPage() {
  useEffect(() => {
    // The API route /api/auth/callback handles the token exchange
    // and redirects to /feed. This page only shows if something
    // went wrong or the user navigated here directly.
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      window.location.href = '/auth/login?error=' + params.get('error');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 mx-auto rounded-full bg-[url('/logo.png')] bg-cover mb-6" />
        <h2 className="text-xl font-semibold text-white mb-2">Completing sign in...</h2>
        <p className="text-[#888] text-sm mb-6">Please wait while we verify your identity.</p>
        <div className="h-5 w-5 mx-auto border-2 border-[#7ba8f0] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
