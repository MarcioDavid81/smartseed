"use client";

import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { PlusIcon } from "lucide-react";
import UpsertCultivarSheetContent from "./UpsertSheetContent";
import { useState } from "react";
import HoverButton from "@/components/HoverButton";

const CreateCultivarButton = ({ onCreated }: { onCreated: () => void }) => {

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openSheet = () => setIsSheetOpen(true);
  const closeSheet = () => setIsSheetOpen(false);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <HoverButton onClick={openSheet}>
          <PlusIcon size={20} />
          Criar cultivar
        </HoverButton>
      </SheetTrigger>
      <UpsertCultivarSheetContent closeSheet={closeSheet} onCreated={onCreated}  />
    </Sheet>
  );
};

export default CreateCultivarButton;
