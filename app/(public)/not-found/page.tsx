import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-found">
      <div className="relative min-h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1600747476229-ceb7f3493f60?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/85 via-green/65 to-gray-900/90" />

        <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium tracking-widest text-gray-100/80">
                ERRO 404
              </p>
              <h1 className="text-3xl font-extrabold text-white md:text-5xl">
                Essa página não brotou por aqui
              </h1>
              <p className="text-base leading-relaxed text-gray-100/90 md:text-lg">
                Parece que você saiu da trilha. Verifique o endereço ou volte para
                a página inicial.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-lg bg-green px-6 py-3 font-bold text-white shadow-lg transition-colors hover:bg-green/90"
                >
                  Voltar para o início
                </Link>
                <Link
                  href="/#contato"
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-transparent px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Falar com a equipe
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-100/70">
            SmartSeed • Gestão agrícola com foco em produtividade
          </p>
        </main>
      </div>
    </div>
  );
}
