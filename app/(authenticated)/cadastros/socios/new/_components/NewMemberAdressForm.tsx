import { Control } from "react-hook-form";
import { MemberFormData } from "@/lib/schemas/memberSchema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash, Trash2, TrashIcon } from "lucide-react";

type Props = {
  index: number;
  control: Control<MemberFormData>;
  remove: (index: number) => void;
  canRemove: boolean;
};

export function NewMemberAdressForm({
  index,
  control,
  remove,
  canRemove,
}: Props) {
  return (
    <div className="border rounded-xl p-4 space-y-4 mt-8 mb-8">
      <div className="grid md:grid-cols-4 gap-4">
        <FormField
          control={control}
          name={`adresses.${index}.stateRegistration`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inscrição Estadual</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`adresses.${index}.zip`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`adresses.${index}.adress`}
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <FormField
          control={control}
          name={`adresses.${index}.number`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`adresses.${index}.complement`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`adresses.${index}.district`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`adresses.${index}.state`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`adresses.${index}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {canRemove && (
        <Button
          type="button"
          className="border border-red bg-transparent text-red font-light"
          onClick={() => remove(index)}
        >
          <Trash2 size={20} />
          Remover
        </Button>
      )}
    </div>
  );
}