// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { IncomingForm } from "formidable";
import { v2 as cloudinary } from "cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function parseForm(req: NextRequest): Promise<{ file: any }> {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ keepExtensions: true });

    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ file: files.file });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    const { file }: any = await parseForm(req);

    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: "avatars",
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("Erro no upload:", err);
    return NextResponse.json({ error: "Erro ao fazer upload da imagem" }, { status: 500 });
  }
}
