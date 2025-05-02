"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { PlusIcon } from "lucide-react";
import UpsertCultivarSheetContent from "./UpsertSheetContent";
import { useState } from "react";

const CreateCultivarButton = () => {

  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const openSheet = () => setIsSheetOpen(true);
  const closeSheet = () => setIsSheetOpen(false);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" onClick={openSheet}>
          <PlusIcon size={20} />
          Criar cultivar
        </Button>
      </SheetTrigger>
      <UpsertCultivarSheetContent closeSheet={closeSheet} />
    </Sheet>
  );
};

export default CreateCultivarButton;
