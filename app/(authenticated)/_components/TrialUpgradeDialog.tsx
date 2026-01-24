"use client";

import HoverButton from "@/components/HoverButton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/contexts/CompanyContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export function TrialUpgradeDialog() {
  const { name } = useCompany();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!name) return;
    if (name.plan !== "TRIAL") return;
    if (!name.planExpiresAt) return;

    const todayKey = `trial-modal-shown-${new Date().toDateString()}`;
    const alreadyShown = localStorage.getItem(todayKey);

    if (alreadyShown) return;

    const expiresAt = new Date(name.planExpiresAt);
    const now = new Date();

    if (expiresAt <= now) return;

    setOpen(true);
    localStorage.setItem(todayKey, "true");
  }, [name]);

  if (!name) return null;

  const daysRemaining = Math.max(
    Math.ceil(
      (new Date(name.planExpiresAt!).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    ),
    0,
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Aproveite o SmartSeed</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              O que está achando do sistema?
            </p>
            <p>
              Você ainda está no plano <strong>TRIAL</strong>, que expira em{" "}
              <strong>{daysRemaining} dia{daysRemaining !== 1 && "s"}</strong>.
            </p>
            <p>
              Faça upgrade agora e garanta acesso a todas as funcionalidades.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent text-red hover:text-red">Depois</AlertDialogCancel>

          <AlertDialogAction asChild>
            <Link href="/assinaturas">
              <Button className="w-fit">
                Fazer upgrade para o PREMIUM
              </Button>
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
