"use client";

import Lottie from "lottie-react";
import tractorAnimation from "@/public/tractor.json";

export function AgroLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="w-40 h-40">
        <Lottie animationData={tractorAnimation} loop={true} />
      </div>

      <p className="text-muted-foreground text-sm font-light animate-pulse">
        Estamos trazendo seus dados...
      </p>
    </div>
  );
}
