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
import LocationForm from "./LocationForm";
import DeleteModal from "@/components/modal/delete-modal";
import { useSession } from "next-auth/react";
import { useGetLocationsQuery } from "@/store/services/locationService";

export interface Location {
  id: number;
  name: string;
  landmark: string;
  location_id: string;
  business_id: number;
  city: string;
  state: string;
  country: string;
  created_at: string;
  updated_at: string;
}

const Location: FC = () => {
  const { data: session } = useSession();
  // GET
  const {
    data: locationList,
    isLoading: locationLoading,
    isFetching: locationFetching,
  } = useGetLocationsQuery({
    buisnessId: session?.user?.business_id,
  });

  const [open, setOpen] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const columns: ColumnDef<Location | null>[] = useMemo(
    () => [
      // {
      //   id: "select",
      //   header: ({ table }) => (
      //     <Checkbox
      //       checked={table.getIsAllPageRowsSelected()}
      //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      //       aria-label="Select all"
      //       className="translate-y-[2px]"
      //     />
      //   ),
      //   cell: ({ row }) => (
      //     <Checkbox
      //       checked={row.getIsSelected()}
      //       onCheckedChange={(value) => row.toggleSelected(!!value)}
      //       aria-label="Select row"
      //       className="translate-y-[2px]"
      //     />
      //   ),
      //   enableSorting: false,
      //   enableHiding: false,
      // },
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
        accessorKey: "landmark",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Landmark" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("landmark")}</div>
            ) : (
              <Skeleton className="w-40 lg:w-56 h-4 bg-[#F5f5f5]" />
            )}
          </>
        ),
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: "city",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="City" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("city")}</div>
            ) : (
              <Skeleton className={`w-10 lg:w-16 h-4 bg-[#F5f5f5]`} />
            )}
          </>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "country",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Country" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("country")}</div>
            ) : (
              <Skeleton className={`w-10 lg:w-16 h-4 bg-[#F5f5f5]`} />
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

  const handleEdit = (data: Location | null) => {
    setSelectedLocation(data);
    toggleModal();
  };

  const handleDelete = (data: Location | null) => {
    setSelectedLocation(data);
    toggleDeleteModal();
  };

  const confirmDelete = () => {
    toast.error("Delete API is not implemented yet.");
    toggleDeleteModal();
  };

  useEffect(() => {
    if (!open && !openDelete) {
      setSelectedLocation(null);
    }
  }, [open, openDelete]);

  return (
    <>
      <div className="bg-[#FFFFFF] p-2 rounded-md overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-xl text-[#4741E1]">Locations</h1>
            <p className="font-medium text-sm">A List of all the locations</p>
          </div>
          <Button onClick={toggleModal} size={"sm"}>
            <PlusCircle className="mr-2 w-4 h-4" />
            Add Location
          </Button>
        </div>
        <Separator />
        <Table
          // @ts-expect-error
          columns={columns}
          data={
            locationLoading || locationFetching
              ? loadingData
              : locationList || []
          }
          filterKey="name"
        />
      </div>
      <Modal
        title={selectedLocation ? "Update Service" : "Add New Service Type"}
        open={open}
        setOpen={toggleModal}
        body={<LocationForm setOpen={toggleModal} data={selectedLocation} />}
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

export default Location;