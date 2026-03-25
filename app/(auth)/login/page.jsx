'use client';

import { Suspense } from 'react';
import LoginPage from '../../../src/pages/auth/login/LoginPage';

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#030712]" />}>
      <LoginPage />
    </Suspense>
  );
}
