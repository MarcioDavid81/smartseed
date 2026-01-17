import { LoginForm } from "@/components/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  keywords: [
    "produção de sementes",
    "gestão de sementeiras",
    "controle de produção e estoque de sementes",
  ],
  description: "O seu sistema de gestão de produção de sementes",
  authors: [
    { name: "Marcio David", url: "https://md-webdeveloper.vercel.app" },
  ],
};

export default function BlogPage() {
  return (
    <div className="flex min-h-svh flex-col bg-background items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <h1 className="text-3xl font-bold text-center text-primary-400 mb-8">
          Blog
        </h1>
        <p>Página em construção...</p>
      </div>
    </div>
  )
}

