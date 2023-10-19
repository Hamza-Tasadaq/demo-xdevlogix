"use client";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { GoPlusCircle as PlusCircle } from "react-icons/go";
import Table from "@/components/table";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { DataTableRowActions } from "@/components/table/data-table-row-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import DeleteModal from "@/components/modal/delete-modal";
import { useSession } from "next-auth/react";
import { useGetPurchasesQuery } from "@/store/services/purchaseService";
import Link from "next/link";

export interface Purchase {
  id: number;
  business_id: number;
  location_id: number;
  supplier_id: number;
  purchase_no: string;
  type: string;
  purchase_status: string;
  payment_status: string;
  purchase_date: string;
  total_before_tax: string;
  tax_rate_id: any;
  tax_amount: string;
  discount_type: any;
  discount_amount: string;
  final_total: string;
  created_by: number;
  source: string;
  payment_note: any;
  created_at: string;
  updated_at: string;
}

const Purchases: FC = () => {
  const { data: session } = useSession();
  // GET
  const {
    data: purchasesList,
    isLoading: purchasesLoading,
    isFetching: purchasesFetching,
  } = useGetPurchasesQuery({
    buisnessId: session?.user?.business_id,
    perPage: -1,
  });

  const [open, setOpen] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );

  const columns: ColumnDef<Purchase | null>[] = useMemo(
    () => [
      {
        accessorKey: "purchase_no",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Purchase #" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("purchase_no")}</div>
            ) : (
              <Skeleton className="w-40 h-4 bg-[#F5f5f5]" />
            )}
          </>
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "purchase_date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Purchase Date" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("purchase_date")}</div>
            ) : (
              <Skeleton className="w-10 lg:w-28 h-4 bg-[#F5f5f5]" />
            )}
          </>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "final_total",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Total" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("final_total")}</div>
            ) : (
              <Skeleton className="w-10 lg:w-28 h-4 bg-[#F5f5f5]" />
            )}
          </>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "payment_status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Payment Status" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("payment_status")}</div>
            ) : (
              <Skeleton className="w-10 lg:w-28 h-4 bg-[#F5f5f5]" />
            )}
          </>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "purchase_status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Purchase Status" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("purchase_status")}</div>
            ) : (
              <Skeleton className="w-10 lg:w-28 h-4 bg-[#F5f5f5]" />
            )}
          </>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DataTableRowActions
            deleteAction={handleDelete}
            editAction={handleEdit}
            row={row}
          />
        ),
      },
    ],
    []
  );

  const loadingData = Array.from({ length: 10 }, () => null);

  const toggleModal = useCallback(() => {
    setOpen((open) => !open);
  }, [open]);

  const toggleDeleteModal = useCallback(() => {
    setOpenDelete((open) => !open);
  }, [open]);

  const handleEdit = (data: Purchase | null) => {
    toast.error("pending")
  };

  const handleDelete = (data: Purchase | null) => {
    setSelectedPurchase(data);
    toggleDeleteModal();
  };

  const confirmDelete = () => {
    toast.error("Delete API is not implemented yet.");
    toggleDeleteModal();
  };

  useEffect(() => {
    if (!open && !openDelete) {
      setSelectedPurchase(null);
    }
  }, [open, openDelete]);

  return (
    <>
      <div className="bg-[#FFFFFF] p-2 rounded-md overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-xl text-[#4741E1]">Purchases</h1>
            <p className="font-medium text-sm">A List of all Purchases</p>
          </div>
          <Button asChild size={"sm"}>
            <Link href={"/products/purchases/create"}>
              <PlusCircle className="mr-2 w-4 h-4" />
              Add Purchase
            </Link>
          </Button>
        </div>
        <Separator />
        <Table
          // @ts-expect-error
          columns={columns}
          data={
            purchasesLoading || purchasesFetching
              ? loadingData
              : purchasesList || []
          }
          filterKey="name"
        />
      </div>

      <DeleteModal
        open={openDelete}
        setOpen={toggleDeleteModal}
        loading={false}
        confirmDelete={confirmDelete}
      />
    </>
  );
};

export default Purchases;
