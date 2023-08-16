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
import Modal from "@/components/modal";
import DeleteModal from "@/components/modal/delete-modal";
import { useSession } from "next-auth/react";
import CategoryForm from "./CategoryForm";
import { useGetCategoriesQuery } from "@/store/services/categoryService";

export interface Category {
  id: number;
  name: string;
  business_id: number;
  parent_id: any;
  created_by: number;
  created_at: string;
  updated_at: string;
}

const Categories: FC = () => {
  const { data: session } = useSession();
  // GET
  const {
    data: categoriesList,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
  } = useGetCategoriesQuery({
    buisnessId: session?.user?.business_id,
    perPage: -1,
  });

  console.log({ categoriesList });

  const [open, setOpen] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const [selectedTypeOfService, setSelectedTypeOfService] =
    useState<Category | null>(null);

  const columns: ColumnDef<Category | null>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("name")}</div>
            ) : (
              <Skeleton className="w-40 h-4 bg-[#F5f5f5]" />
            )}
          </>
        ),
        enableSorting: true,
        enableHiding: false,
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

  const handleEdit = (data: Category | null) => {
    setSelectedTypeOfService(data);
    toggleModal();
  };

  const handleDelete = (data: Category | null) => {
    setSelectedTypeOfService(data);
    toggleDeleteModal();
  };

  const confirmDelete = () => {
    toast.error("Delete APi is not implemented Yet");
    toggleDeleteModal();
  };

  useEffect(() => {
    if (!open && !openDelete) {
      setSelectedTypeOfService(null);
    }
  }, [open, openDelete]);

  return (
    <>
      <div className="bg-[#FFFFFF] p-2 rounded-md overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-xl text-[#4741E1]">Categories</h1>
            <p className="font-medium text-sm">A List of all Categories</p>
          </div>
          <Button onClick={toggleModal} size={"sm"}>
            <PlusCircle className="mr-2 w-4 h-4" />
            Add Category
          </Button>
        </div>
        <Separator />
        <Table
          // @ts-expect-error
          columns={columns}
          data={
            categoriesLoading || categoriesFetching
              ? loadingData
              : categoriesList || []
          }
          filterKey="name"
        />
      </div>
      <Modal
        title={
          selectedTypeOfService ? "Update Service" : "Add New Service Type"
        }
        open={open}
        setOpen={toggleModal}
        body={
          <CategoryForm setOpen={toggleModal} data={selectedTypeOfService} />
        }
      />
      <DeleteModal
        open={openDelete}
        setOpen={toggleDeleteModal}
        loading={false}
        confirmDelete={confirmDelete}
      />
    </>
  );
};

export default Categories;
