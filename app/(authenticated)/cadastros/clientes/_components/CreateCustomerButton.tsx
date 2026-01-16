"use client";

import HoverButton from "@/components/HoverButton";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Customer } from "@/types";
import UpsertCustomerModal from "./UpsertCustomerModal";

interface Props {
  customer?: Customer;
}

const CreateCustomerButton = ({ customer }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <HoverButton onClick={() => setIsOpen(true)}>
        <PlusIcon size={20} />
        Cliente
      </HoverButton>
      <UpsertCustomerModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        customer={customer}
      />
    </div>
  );
};

export default CreateCustomerButton;
