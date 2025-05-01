"use client";
import { useEffect, useState } from "react";
import { LogOutIcon } from "lucide-react";
import { FaSpinner } from "react-icons/fa";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Garante que os cookies sejam incluídos
      });

      if (response.ok) {
        toast.success("Logout bem-sucedido");
        // Força uma atualização completa do estado da aplicação
        window.location.href = "/"; // Ou router.refresh() + router.push("/login")
      } else {
        throw new Error("Falha ao fazer logout");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao fazer logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      title="Sair da conta"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Sair da conta"
      className={`p-2 rounded-md transition-colors ${
        loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green hover:text-white"
      }`}
    >
      {loading ? (
        <FaSpinner className="animate-spin" />
      ) : (
        <LogOutIcon className="w-5 h-5" />
      )}
    </button>
  );
}