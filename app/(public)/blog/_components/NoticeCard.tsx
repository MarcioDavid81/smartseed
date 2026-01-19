import Image from "next/image";
import Link from "next/link";

interface NoticeCardProps {
  thumbnail: string;
  title: string;
  subtitle: string;
  btnLabel: string;
  href: string;
  date: string;
  author: string;
}

export default function NoticeCard({
  thumbnail,
  title,
  subtitle,
  btnLabel,
  href,
  date,
  author,
}: NoticeCardProps) {
  return (
    <div className="mt-6 mb-6 group overflow-hidden rounded-lg shadow-lg min-h-[560px]">
      <Link href={href}>
        <Image
          src={thumbnail}
          alt={title}
          width={300}
          height={300}
          className="rounded-t-lg w-full h-full object-center group-hover:scale-105 transition-all duration-300 ease-in-out"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4 gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="truncate">{subtitle}</p>
        <div className="flex gap-4 mt-2">
        <p className="mt-2 text-xs font-extralight text-gray-500">{date}</p>
          <p className="mt-2 text-xs font-extralight text-gray-500">{author}</p>
        </div>
        <div className="mt-6">
          <Link
            className="px-4 py-2 rounded bg-green hover:bg-green/90 text-white"
            href={href}
          >
            {btnLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}