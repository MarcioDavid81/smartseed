import { Suspense } from "react";
import VerifyEmailClient from "./_components/verify-email-client";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailClient />
    </Suspense>
  );
}

function VerifyEmailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-lg font-medium">Carregando…</p>
    </div>
  );
}
