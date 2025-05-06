"use client"

import HoverButton from "@/components/HoverButton"
import { ChevronRightIcon } from "lucide-react"
import { useState } from "react";
import NewCustomerModal from "./NewCustomerModal";

const CreateCustomerButton = () => {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <HoverButton onClick={() => setIsOpen(true)}>
                Cliente
                <ChevronRightIcon size={20} />
            </HoverButton>
            <NewCustomerModal isOpen={isOpen} onClose={() => setIsOpen(false)}  />
        </div>
    )
}

export default CreateCustomerButton