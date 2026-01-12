"use client"

import { PlusIcon } from "lucide-react"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import UpsertPlotModal from "../../../talhoes/_components/UpsertPlotModal";

const NewPlotButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsOpen(true)} className=" bg-green text-white" type="button">
        <PlusIcon size={20} />
          Talhão
        </Button>
        <UpsertPlotModal  
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
    </div>
  )
}

export default NewPlotButton