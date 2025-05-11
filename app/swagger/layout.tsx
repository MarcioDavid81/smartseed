import { icons } from "lucide-react"

export const metadata = {
  title: 'Documentação da API do Sistema Smart Seed',
  description: 'Documentação da API do Sistema Smart Seed',
  icons: icons
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
