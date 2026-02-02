"use client";

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

type DialogMode = "TRIAL_ACTIVE" | "TRIAL_EXPIRED";

export function TrialUpgradeDialog() {
  const { name } = useCompany();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode | null>(null);

  useEffect(() => {
    if (!name) return;

    let dialogMode: DialogMode | null = null;

    // 🟢 Trial ativo
    if (name.plan === "TRIAL") {
      dialogMode = "TRIAL_ACTIVE";
    }

    // 🔴 Trial expirado → plano BASIC
    if (name.plan === "BASIC") {
      dialogMode = "TRIAL_EXPIRED";
    }

    if (!dialogMode) return;

    const todayKey = `plan-modal-shown-${dialogMode}-${new Date().toDateString()}`;
    if (localStorage.getItem(todayKey)) return;

    setMode(dialogMode);
    setOpen(true);
    localStorage.setItem(todayKey, "true");
  }, [name]);

  if (!name || !mode) return null;

  const daysRemaining =
    mode === "TRIAL_ACTIVE" && name.planExpiresAt
      ? Math.max(
          Math.ceil(
            (new Date(name.planExpiresAt).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24),
          ),
          0,
        )
      : 0;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {mode === "TRIAL_ACTIVE"
              ? "Aproveite o SmartSeed"
              : "Seu plano expirou"}
          </AlertDialogTitle>

          <AlertDialogDescription className="space-y-2">
            {mode === "TRIAL_ACTIVE" && (
              <>
                <p>O que está achando do sistema?</p>
                <p>
                  Você ainda está no plano <strong>TRIAL</strong>, que expira em{" "}
                  <strong>
                    {daysRemaining} dia{daysRemaining !== 1 && "s"}
                  </strong>.
                </p>
                <p>
                  Faça upgrade agora e garanta acesso a todas as funcionalidades.
                </p>
              </>
            )}

            {mode === "TRIAL_EXPIRED" && (
              <>
                <p>
                  Poxa, seu período de testes acabou e seu plano foi
                  rebaixado para <strong>BASIC</strong>.
                </p>
                <p>
                  Você perdeu acesso às principais funcionalidades do sistema.
                </p>
                <p>
                  Que tal fazer um upgrade agora e continuar aproveitando tudo o
                  que o SmartSeed oferece?
                </p>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent text-red hover:text-red">
            Depois
          </AlertDialogCancel>

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
