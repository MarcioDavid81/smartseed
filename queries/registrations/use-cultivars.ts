import { useCycle } from "@/contexts/CycleContext";
import { getToken } from "@/lib/auth-client";
import { getCultivarsByProductType, getCultivarsByProductTypeAndStock } from "@/services/registrations/culivar";
import { useQuery } from "@tanstack/react-query";

export function useCycleCultivars(isOpen: boolean) {
  const { selectedCycle } = useCycle();
  const token = getToken();

  return useQuery({
    queryKey: ["cultivars", selectedCycle?.productType],
    queryFn: () =>
      getCultivarsByProductType(selectedCycle!.productType, token!),
    enabled: !!selectedCycle?.productType && isOpen,
  });
}

export function useCycleCultivarsWithStock(isOpen: boolean) {
  const { selectedCycle } = useCycle();
  const token = getToken();

  return useQuery({
    queryKey: ["cultivars-with-stock", selectedCycle?.productType],
    queryFn: () =>
      getCultivarsByProductTypeAndStock(selectedCycle!.productType, token!),
    enabled: !!selectedCycle?.productType && isOpen,
  });
}