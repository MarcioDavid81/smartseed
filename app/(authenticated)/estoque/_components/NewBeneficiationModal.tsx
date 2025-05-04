import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const NewBeneficiationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Descarte</DialogTitle>
        </DialogHeader>
        <Button
          className={`relative overflow-hidden px-4 py-2 w-full font-medium border-2 border-green rounded-lg bg-transparent text-gray-800  transition-all duration-300 ease-in-out`}
        >
          <span className="relative flex items-center gap-2 z-10">
            Salvar
          </span>
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewBeneficiationModal;
