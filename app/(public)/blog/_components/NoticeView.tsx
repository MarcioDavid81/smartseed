"use client";

import { getNotices } from "@/actions/get-notices";
import { Notice } from "@/types";
import { useEffect, useState } from "react";
import Navbar from "../../_components/Navbar";
import HeroBlog from "./Hero";
import NoticeCard from "./NoticeCard";
import Footer from "../../_components/Footer";

export default function NoticeView() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotices() {
      try {
        const data = await getNotices();
        setNotices(data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotices();
  }, []);

  return (
    <>
      {/* Header da página */}
      <Navbar />
      <HeroBlog title="Blog" subtitle="Fique por dentro das novidades do mundo Agro!" />
      <div className="container w-[90%] mx-auto flex flex-col mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-8 border-green border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-4 text-gray-600">Carregando...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center justify-center group-[&>*]:">
            {notices.map((notice: Notice) => (
              <NoticeCard
                key={notice.id}
                thumbnail={notice.acf.thumbnail}
                title={notice.title.rendered}
                subtitle={notice.acf.subtitle}
                date={`Postado dia: ${new Date(notice.date).toLocaleDateString("pt-BR")}`}
                author={`Por: ${notice.acf.author.data.display_name}`}
                btnLabel="Leia Mais"
                href={`/blog/${notice.acf.slug}`}
              />
            ))}
          </div>
        )}
      </div>
        <Footer />
    </>
  );
}