'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, UserIcon } from 'lucide-react';

type UploadAvatarProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  initialImageUrl?: string | null;
  fallbackText?: string | ReactNode;
};

export function UploadAvatar({
  value,
  onChange,
  initialImageUrl,
  fallbackText = <UserIcon className='text-green'/>,
}: UploadAvatarProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialImageUrl ?? null,
  );

  /** 🔹 Atualiza preview quando o form muda */
  useEffect(() => {
    if (!value) return;

    const url = URL.createObjectURL(value);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    onChange(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar preview */}
      <div className="relative">
        <Avatar className="h-28 w-28 border-2 border-dashed border-green">
          <AvatarImage src={previewUrl ?? undefined} />
          <AvatarFallback className="text-sm">
            {fallbackText}
          </AvatarFallback>
        </Avatar>

        {/* Ícone overlay */}
        <label
          htmlFor="avatar-upload"
          className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-green text-white shadow"
        >
          <Camera size={14} />
        </label>
      </div>

      {/* Input escondido */}
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
