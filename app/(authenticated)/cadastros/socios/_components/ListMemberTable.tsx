"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Member } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, RefreshCw } from "lucide-react";
import { AgroLoader } from "@/components/agro-loader";
import { MembersDataTable } from "./MemberDataTable";
import { useMembers } from "@/queries/registrations/use-member";
import EditCustomerButton from "../../clientes/_components/EditCustomerButton";
import { MemberDetailButton } from "./MemberDetailButton";

export function ListMembersTable() {

  const {
      data: members = [],
      isLoading,
      isFetching,
      refetch,
    } = useMembers();

  const columns: ColumnDef<Member>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="text-left px-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row: { original } }) => original.name,
    },
    {
      accessorKey: "cpf",
      header: "CPF",
      accessorFn: (row) => row.cpf,
      cell: ({ row: { original } }) => original.cpf,
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      accessorFn: (row) => row.phone,
      cell: ({ row: { original } }) => original.phone,
    },
    {
      accessorKey: "email",
      header: "Email",
      accessorFn: (row) => row.email,
      cell: ({ row: { original } }) => original.email,
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-center">Ações</div>,
      cell: ({ row }) => {
        const member = row.original;
        return (
          <div className="flex items-center justify-center gap-4">
            <MemberDetailButton id={member.id} />
          </div>
        );
      },
    },
  ];

  return (
    <Card className="p-4 dark:bg-primary font-light">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="font-light">Lista de Sócios</h2>
        <Button variant={"ghost"} onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={16} className={`${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {isLoading ? (
        <AgroLoader />
      ) : (
        <MembersDataTable columns={columns} data={members} />
      )}
    </Card>
  );
}
