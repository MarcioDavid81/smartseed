import { MemberFormData } from "@/lib/schemas/memberSchema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAddress } from "@/queries/adress/use-adress";
import { Trash2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import InputMask from "react-input-mask";

type Props = {
  index: number;
  remove: (index: number) => void;
  canRemove: boolean;
};

export function NewMemberAdressForm({
  index,
  remove,
  canRemove,
}: Props) {
  const form = useFormContext<MemberFormData>();

  const { states, cities, isLoadingCities, isLoadingStates } = useAddress({
    isOpen: true,
    form,
    stateField: `adresses.${index}.state`,
    cityField: `adresses.${index}.city`,
  });

  return (
    <div className="border rounded-xl p-4 space-y-4 mt-8 mb-8">
      <div className="grid md:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name={`adresses.${index}.stateRegistration`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inscrição Estadual</FormLabel>
              <FormControl>
                <InputMask
                  mask="999/999 999-9"
                  value={field.value}
                  onChange={field.onChange}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      placeholder="Inscrição Estadual"
                      type="text"
                    />
                  )}
                </InputMask>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`adresses.${index}.zip`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <InputMask
                  mask="99999-999"
                  value={field.value}
                  onChange={field.onChange}
                >
                  {(inputProps: any) => (
                    <Input {...inputProps} placeholder="CEP" type="text" />
                  )}
                </InputMask>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
          name={`adresses.${index}.state`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger disabled={isLoadingStates}>
                        <SelectValue placeholder="Selecione um estado" />
                      </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.sigla}>
                          {state.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`adresses.${index}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!form.watch(`adresses.${index}.state`) || isLoadingCities}
                >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  <SelectContent>
                    {cities.map((c) => (
                      <SelectItem key={c.id} value={c.nome}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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