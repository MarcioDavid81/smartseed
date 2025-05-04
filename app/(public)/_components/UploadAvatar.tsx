'use client';

import { useState } from 'react';
import Image from 'next/image';

type UploadAvatarProps = {
  onFileSelect: (file: File) => void;
};

export default function UploadAvatar({ onFileSelect }: UploadAvatarProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect(file);
  };

  return (
    <div className="space-y-2">
      {previewUrl && (
        <Image
          src={previewUrl}
          alt="Imagem de avatar selecionada"
          width={50}
          height={50}
          className="rounded-full object-cover"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="bg-green w-full rounded-md text-sm file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-white file:bg-green text-white cursor-pointer file:cursor-pointer"
      />
    </div>
  );
}
