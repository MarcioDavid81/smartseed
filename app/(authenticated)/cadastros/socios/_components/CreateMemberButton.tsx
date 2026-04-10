"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import Link from "next/link";

const CreateMemberButton = () => {

  const url = "/cadastros/socios/new"

  return (
    <div>
      <Link href={url}>
        <HoverButton>
          <PlusIcon size={20} />
          Sócio
        </HoverButton>
      </Link>
    </div>
  );
};

export default CreateMemberButton;
