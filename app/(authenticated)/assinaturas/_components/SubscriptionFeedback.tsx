"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Confetti from "react-confetti";

export default function SubscriptionFeedback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status");

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (status === "success") {
      setShowConfetti(true);

      const stopConfetti = setTimeout(() => {
        setShowConfetti(false);
      }, 3500);

      const clearUrl = setTimeout(() => {
        router.replace("/assinaturas");
      }, 4000);

      return () => {
        clearTimeout(stopConfetti);
        clearTimeout(clearUrl);
      };
    }
  }, [status, router]);

  if (status !== "success") return null;

  return (
    <>
      {showConfetti && (
        <Confetti
          numberOfPieces={200}
          gravity={1.0}
          recycle={false}
        />
      )}

      <div className="mb-6 rounded-lg border border-green bg-green-50 p-4 text-green-800">
        <h2 className="text-lg font-medium mb-1">
          🎉 Assinatura realizada com sucesso!
        </h2>
        <p className="text-sm">
          Seu plano premium já está ativo. Aproveite todos os recursos do SmartSeed.
        </p>
      </div>
    </>
  );
}
