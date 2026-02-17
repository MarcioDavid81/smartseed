"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  UseFormReturn,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import { getCitiesByState, getStates } from "@/services/ibge/ibge-service";

type Props<T extends FieldValues> = {
  isOpen: boolean;
  form: UseFormReturn<T>;
  stateField: Path<T>;
  cityField: Path<T>;
};

export function useAddress<T extends FieldValues>({
  isOpen,
  form,
  stateField,
  cityField,
}: Props<T>) {

  const currentState = form.watch(stateField);

  const statesQuery = useQuery({
    queryKey: ["ibge-states"],
    queryFn: getStates,
    enabled: isOpen,
    staleTime: Infinity,
  });

  const citiesQuery = useQuery({
    queryKey: ["ibge-cities", currentState],
    queryFn: () => getCitiesByState(currentState as string),
    enabled: !!currentState,
  });

  useEffect(() => {
    form.setValue(cityField, "" as PathValue<T, Path<T>>);
  }, [currentState]);

  return {
    states: statesQuery.data ?? [],
    cities: citiesQuery.data ?? [],
    isLoadingStates: statesQuery.isLoading,
    isLoadingCities: citiesQuery.isLoading,
  };
}
