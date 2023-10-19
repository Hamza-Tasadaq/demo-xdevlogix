"use client";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ColumnDef } from "@tanstack/react-table";
import { GoPlusCircle as PlusCircle } from "react-icons/go";
import { GoChevronDown as ChevronDown } from "react-icons/go";
import Table from "@/components/table";
import { DataTableColumnHeader } from "@/components/table/data-table-column-header";
import { DataTableRowActions } from "@/components/table/data-table-row-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Modal from "@/components/modal";
import DeleteModal from "@/components/modal/delete-modal";
import { useSession } from "next-auth/react";
import { useGetLocationsQuery } from "@/store/services/locationService";
import { Variation, VariationTemplate } from "../variations";
import { useGetProductsQuery } from "@/store/services/productService";
import { useDeleteProductMutation } from "@/store/services/productService";
import Image from "next/image";
import Link from "next/link";
import ImportProductForm from "./ImportForm";
import useProduct from "@/hooks/useProduct";

export interface ProductImage {
  id: number;
  business_id: number;
  product_id: number;
  slug: string;
  created_at: string;
  updated_at: string;
  image_url: string;
}

export interface ProductVariation {
  id: number;
  product_id: number;
  variation_id: number;
  business_id: number;
  variation_template_id: string;
  last_updated_by: any;
  created_at: string;
  updated_at: string;
  variations: Omit<Variation, "variation_template">;
  variation_template: VariationTemplate;
  product_price: ProductPrice;
}

export interface ProductPrice {
  id: number;
  product_variation_id: number;
  tax_type: string;
  price_exclusive_tax: string;
  price_inclusive_tax: string;
  profit_margin: string;
  selling_price: string;
  selling_price_inc_tax: string;
  business_id: number;
  tax_id: any;
  last_updated_by: any;
  created_at: string;
  updated_at: string;
}

export interface ProductStock {
  id: number;
  business_id: number;
  location_id: number;
  product_id: number;
  product_variation_id: number;
  last_updated_by: any;
  quantity_available: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  business_id: number;
  unit_id: number;
  category_id: number;
  sub_category_id: any;
  sku: string;
  type: string;
  vendor_id: any;
  brand_id: any;
  manage_stock_status: number;
  alerty_quantity: number;
  not_for_selling: number;
  tax_type: string;
  weight: any;
  barcode_id: any;
  tax_id: any;
  created_at: string;
  updated_at: string;
  product_time_id: any;
  product_images: ProductImage[];
  product_time: any[];
  product_variations: ProductVariation[];
  product_stock: ProductStock[];
}
const ProductsList: FC = () => {
  const { data: session } = useSession();
  // GET
  const {
    data: productsList,
    isLoading: productsLoading,
    isFetching: productsFetching,
  } = useGetProductsQuery({
    buisnessId: session?.user?.business_id,
    perPage: -1,
  });

  const [open, setOpen] = useState<boolean>(false);
  const [openImport, setOpenImport] = useState<boolean>(false);
  const [openDelete, setOpenDelete] = useState<boolean>(false);

  const [selectedProductList, setSelectedProductList] =
    useState<Product | null>(null);

  const columns: ColumnDef<Product | null>[] = useMemo(
    () => [
      {
        accessorKey: "product_images",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Image" />
        ),
        cell: ({ row }) => {
          if (row?.original) {
            const [image] = row.getValue("product_images") as ProductImage[];
            if (image) {
              return (
                <Image
                  src={image.image_url}
                  alt={String(image.product_id)}
                  width={40}
                  height={40}
                  className="rounded-full object-contain"
                />
              );
            }
          } else {
            return <Skeleton className="w-10 h-10 rounded-full bg-[#F5f5f5]" />;
          }
        },
        enableSorting: false,
        enableHiding: true,
      },
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
              <Skeleton className="w-10 h-4 bg-[#F5f5f5]" />
            )}
          </>
        ),
        enableSorting: true,
        enableHiding: false,
      },
      {
        accessorKey: "description",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("description")}</div>
            ) : (
              <Skeleton className={`w-10 h-4 bg-[#F5f5f5]`} />
            )}
          </>
        ),
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "product_stock",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Stock" />
        ),
        cell: ({ row }) => {
          if (row?.original) {
            const [stock] = row.getValue("product_stock") as ProductStock[];
            if (stock) {
              return <div>{stock.quantity_available}</div>;
            }
          } else {
            return <Skeleton className="w-10 h-4 rounded-full bg-[#F5f5f5]" />;
          }
        },
        enableSorting: true,
        enableHiding: true,
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="type" />
        ),
        cell: ({ row }) => (
          <>
            {row?.original ? (
              <div>{row.getValue("type")}</div>
            ) : (
              <Skeleton className={`w-10 h-4 bg-[#F5f5f5]`} />
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

  const { setProduct } = useProduct();
  const router = useRouter();

  const [deleteProduct, response] = useDeleteProductMutation();
  const {
    isLoading: deleteLoading,
    isError: deleteError,
    isSuccess: deleteSuccess,
  } = response;

  const loadingData = Array.from({ length: 10 }, () => null);
  const [openImportModal, setOpenImportModal] = useState(false);

  const toggleImportModal = () => {
    setOpenImportModal((openImportModal) => !openImportModal);
  };

  const toggleDeleteModal = useCallback(() => {
    setOpenDelete((open) => !open);
  }, [open]);

  const handleEdit = (product: Product | null) => {
    setProduct(product!);
    router.push("/products/products-list/create");
  };

  const handleDelete = (data: Product | null) => {
    setSelectedProductList(data);
    toggleDeleteModal();
  };

  const confirmDelete = () => {
    deleteProduct({ id: selectedProductList?.id });
  };

  useEffect(() => {
    if (deleteError) {
      toast.error("Something Wrong.");
    }
    if (deleteSuccess) {
      toast.success("Product Deleted Successfully.");
      toggleDeleteModal();
    }
  }, [deleteError, deleteSuccess]);

  useEffect(() => {
    if (!open && !openDelete) {
      setSelectedProductList(null);
    }
  }, [open, openDelete]);

  return (
    <>
      <div className="bg-[#FFFFFF] p-2 rounded-md overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-xl text-[#4741E1]">Products</h1>
            <p className="font-medium text-sm">A List of all the Products.</p>
          </div>
          <div className="flex items-center gap-5">
            <Button onClick={toggleImportModal} size={"sm"}>
              <ChevronDown className="mr-2 w-4 h-4" />
              Import Product
            </Button>
            <Button asChild size={"sm"}>
              <Link href={"/products/products-list/create"}>
                <PlusCircle className="mr-2 w-4 h-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>
        <Separator />
        <Table
          // @ts-expect-error
          columns={columns}
          data={
            productsLoading || productsFetching
              ? loadingData
              : productsList || []
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
      <Modal
        title={"Import Product"}
        open={openImportModal}
        setOpen={toggleImportModal}
        body={<ImportProductForm setOpen={toggleImportModal} />}
      />
    </>
  );
};

export default ProductsList;
