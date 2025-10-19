"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const CreateCycleButton = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/agricultura/safras/new");
  };

  return (
    <div>
      <HoverButton onClick={handleClick}>
        <PlusIcon size={20} />
        Safra
      </HoverButton>
    </div>
  );
};

export default CreateCycleButton;
