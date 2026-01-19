import { Metadata } from "next";
import NoticeView from "./_components/NoticeView";

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
        <NoticeView />
  )
}

