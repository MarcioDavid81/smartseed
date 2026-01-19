import { getNoticeBySlug } from "@/actions/get-notices";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "../../_components/Navbar";
import HeroBlog from "../_components/Hero";
import Footer from "../../_components/Footer";

interface NoticePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: NoticePageProps): Promise<Metadata> {
  const notice = await getNoticeBySlug(params);

  return {
    title: `${notice?.title.rendered}`,
    description: notice?.acf.subtitle,
  };
}

export default async function NoticePage({ params }: NoticePageProps) {
  const notice = await getNoticeBySlug(params);

  if (!notice)
    redirect("/not-found");

  return (
    <>
    {/* Header da página */}
    <Navbar />
    <HeroBlog title={notice.title.rendered} subtitle={notice.acf.subtitle} />
      <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Thumbnail */}
      {notice.acf.thumbnail && (
        <div className="mb-1 rounded-t-lg overflow-hidden">
          <Image
            src={notice.acf.thumbnail}
            alt={notice.title.rendered}
            width={800}
            height={600}
            className="w-full h-full object-cover"
          />
          {/* Subtitle */}
          {notice.acf.subtitle && (
            <p className="text-xs text-gray-700 mb-2">{notice.acf.subtitle}</p>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-4 text-gray-600 font-extralight mb-6 text-xs">
        <span>{`Postado dia: ${new Date(notice.date).toLocaleDateString("pt-BR")}`}</span>
        {notice.acf.author?.data?.display_name && (
          <span>Por: {notice.acf.author.data.display_name}</span>
        )}
        {notice.acf.category?.name && (
          <span className=" text-lime-500 border border-lime-500 px-2 py-1 rounded-full">
            {notice.acf.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="max-w-none">{notice.acf.content}</div>
      <div className="mt-6">
        <Link
          href="/blog"
          className="px-4 py-2 rounded bg-green hover:bg-green/90 text-white"
        >
          Voltar
        </Link>
      </div>
    </div>
    <Footer />
    </>
  );
}