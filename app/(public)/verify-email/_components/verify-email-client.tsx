"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const hasVerifiedRef = useRef(false);

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  useEffect(() => {
    if (!token || hasVerifiedRef.current) return;

    hasVerifiedRef.current = true;

    fetch(`/api/auth/verify-email?token=${token}`)
      .then((res) => {
        if (res.ok) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium">Verificando seu e-mail…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-green">
          E-mail verificado com sucesso!
        </h1>

        <button
          onClick={() => router.push("/login")}
          className="rounded bg-green px-6 py-2 font-medium text-white"
        >
          Ir para o login
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold text-red">
        Não foi possível verificar o e-mail
      </h1>
      <button
        onClick={() => router.push("/login")}
        className="rounded bg-gray-800 px-6 py-2 font-medium text-white"
      >
        Voltar para o login
      </button>
    </div>
  );
}
