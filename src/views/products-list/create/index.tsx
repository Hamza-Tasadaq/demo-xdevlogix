"use client";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BiLoaderAlt as Loader } from "react-icons/bi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useGetUnitsQuery } from "@/store/services/unitService";
import { useGetTaxratesQuery } from "@/store/services/taxrateService";
import { useGetLocationsQuery } from "@/store/services/locationService";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Unit } from "@/views/units";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Location } from "@/views/locations";
import FileInput from "@/components/ui/file-input";
import { Button } from "@/components/ui/button";
import { useCreateProductMutation } from "@/store/services/productService";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import { useEffect, useMemo } from "react";
import { useGetCategoriesQuery } from "@/store/services/categoryService";
import { Category } from "@/views/categories";
import { useGetVariationsQuery } from "@/store/services/variationService";
import { Variation } from "@/views/variations";
import VariationsInput from "./VariationInput";
import { Taxrate } from "@/views/taxrates";
import { useGetBrandsQuery } from "@/store/services/brandService";
import { Brand } from "@/views/brands";
import { useGetBarcodesQuery } from "@/store/services/barCodeService";
import { Barcode } from "@/views/bar-codes";
import useProduct from "@/hooks/useProduct";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  sku: z.string().optional(),
  type: z.string().min(1, { message: "Type is required." }),
  unit_id: z.string().min(1, { message: "Unit is required." }),
  product_images:
    typeof window === "undefined" ? z.any() : z.array(z.instanceof(File)),
  tax_type: z.string().min(1, { message: "Tax Type is required." }),
  location_id: z.string().min(1, { message: "Location is required." }),
  manage_stock_status: z.boolean(),
  selling_price: z.string().optional(),
  selling_price_inc_tax: z.string().optional(),
  quantity: z.string().optional(),
  category_id: z.string().min(1, { message: "Category is required." }),
  brand_id: z.string().min(1, { message: "Brand is required." }),
  barcode_id: z.string().min(1, { message: "Barcode is required." }),
  tax_id: z.string().min(1, { message: "Tax is required." }),
  weight: z.string().min(1, { message: "Wright is required." }),
  price_exclusive_tax: z.string().optional(),
  price_inclusive_tax: z.string().optional(),
  profit_margin: z.string().optional(),
  variation_id: z.string().optional(),
  variation_list: z.array(
    z.object({
      value: z.string().min(1, { message: "Value is required." }),
      price_exclusive_tax: z
        .string()
        .min(1, { message: "Price exclusive tax is required." }),
      price_inclusive_tax: z
        .string()
        .min(1, { message: "Price inclusive tax is required." }),
      profit_margin: z
        .string()
        .min(1, { message: "Profit Margin is required." }),
      selling_price: z
        .string()
        .min(1, { message: "Selling Price is required." }),
      selling_price_inc_tax: z
        .string()
        .min(1, { message: "Selling Price Inc Tax is required." })
        .optional(),
    })
  ),
  business_id: z.coerce.number(),
});

const CreateProduct = () => {
  const { data: session } = useSession();

  const { product } = useProduct();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      sku: product?.sku || "",
      type: product?.type || "",
      description: product?.description || "",
      tax_type: product?.tax_type || "",
      location_id: "",
      unit_id: String(product?.unit_id) || "",
      manage_stock_status: !!product?.manage_stock_status || false,
      selling_price: "",
      selling_price_inc_tax: "",
      quantity: "",
      product_images: [],
      category_id: "",
      price_exclusive_tax: "",
      price_inclusive_tax: "",
      profit_margin: "",
      brand_id: "",
      barcode_id: "",
      tax_id: "",
      weight: "",
      variation_list: [],
      business_id: Number(session?.user?.business_id),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variation_list",
  });

  const handleAppend = (value: string) => {
    append({
      value,
      price_exclusive_tax: "",
      price_inclusive_tax: "",
      profit_margin: "",
      selling_price: "",
      selling_price_inc_tax: "",
    });
  };

  const { data: unitsList, isLoading: unitsLoading } = useGetUnitsQuery({
    buisnessId: session?.user?.business_id,
    perPage: -1,
  });

  const { data: taxratesList, isLoading: taxratesLoading } =
    useGetTaxratesQuery({
      buisnessId: session?.user?.business_id,
      perPage: -1,
    });

  const { data: brandsList, isLoading: brandsLoading } = useGetBrandsQuery({
    buisnessId: session?.user?.business_id,
    perPage: -1,
  });

  const { data: barcodesList, isLoading: barcodesLoading } =
    useGetBarcodesQuery({
      buisnessId: session?.user?.business_id,
      perPage: -1,
    });

  const { data: locationsList, isLoading: locationsLoading } =
    useGetLocationsQuery({
      buisnessId: session?.user?.business_id,
    });

  const { data: categoriesList, isLoading: categoriesLoading } =
    useGetCategoriesQuery({
      buisnessId: session?.user?.business_id,
      perPage: -1,
    });

  const { data: variationsList, isLoading: variationsLoading } =
    useGetVariationsQuery({
      buisnessId: session?.user?.business_id,
      perPage: -1,
    });

  const variations = useMemo(() => {
    return variationsList?.find(
      (list) => String(list.id) === form.watch("variation_id")
    );
  }, [variationsList, form.watch("variation_id")]);

  useEffect(() => {
    if (variations) {
      variations?.variation_template?.forEach((variationTemp) => {
        handleAppend(variationTemp.tem_name);
      });
    }
  }, [variations]);

  const [create, createResponse] = useCreateProductMutation();

  const {
    isLoading: createLoading,
    isError: createError,
    isSuccess: createSuccess,
  } = createResponse;

  useEffect(() => {
    if (createError) {
      toast.error("Something Wrong.");
    }
    if (createSuccess) {
      toast.success("Product Added Successfully.");
      router.push("/products/products-list");
    }
  }, [createError, createSuccess]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (product === null) {
      const formdata = new FormData();
      formdata.append("name", values.name);
      formdata.append("description", values.description);
      if (values.sku) {
        formdata.append("sku", values.sku);
      }
      formdata.append("type", values.type);
      formdata.append("unit_id", values.unit_id);
      formdata.append("business_id", values.business_id?.toString());
      formdata.append(
        "manage_stock_status",
        values.manage_stock_status ? "1" : "0"
      );
      formdata.append(`product_price[tax_type]`, values.tax_type);
      if (values.type === "single") {
        formdata.append(
          `product_price[0][selling_price]`,
          String(values.selling_price)
        );
        formdata.append(
          `product_price[0][price_exclusive_tax]`,
          String(values.price_exclusive_tax)
        );
        formdata.append(
          `product_price[0][price_inclusive_tax]`,
          String(values.price_inclusive_tax)
        );
        formdata.append(
          `product_price[0][profit_margin]`,
          String(values.profit_margin)
        );
        formdata.append(
          `product_price[0][selling_price_inc_tax]`,
          String(values.selling_price_inc_tax)
        );
        formdata.append(
          `product_price[0][selling_price_inc_tax]`,
          String(values.selling_price_inc_tax)
        );
      }

      if (values.type === "variable") {
        values?.variation_list?.forEach((variation, index) => {
          formdata.append(
            `product_price[${index}][price_exclusive_tax]`,
            variation.price_exclusive_tax
          );
          formdata.append(
            `product_price[${index}][price_inclusive_tax]`,
            variation.price_inclusive_tax
          );
          formdata.append(
            `product_price[${index}][profit_margin]`,
            variation.profit_margin
          );
          formdata.append(
            `product_price[${index}][selling_price]`,
            variation.selling_price
          );
          formdata.append(
            `product_price[${index}][selling_price_inc_tax]`,
            variation?.selling_price_inc_tax || ""
          );
        });
      }
      formdata.append(`product_price[business_id]`, String(values.business_id));
      formdata.append(`product_locations[]`, values.location_id);
      formdata.append(`product_images[]`, values.product_images[0]);
      formdata.append("brand_id", values.brand_id);
      formdata.append("barcode_id", values.barcode_id);
      formdata.append("tax_id", values.tax_id);
      formdata.append("weight", values.weight);

      if (values.quantity) {
        formdata.append(
          `opening_stock[${values.location_id}][quantity][0]`,
          values.quantity
        );
      }
      formdata.append("category_id", values.category_id);
      create({ data: formdata });
    } else {
      toast.success("Update");
    }
  }

  const handleFileSelect = (files: File[]) => {
    form.setValue("product_images", files);
  };
  const loadingData = Array.from({ length: 10 }, (_, index) => index + 1);
  return (
    <>
      <div className="bg-[#FFFFFF] p-2 rounded-md overflow-hidden space-y-4">
        <h1 className="text-[#4741E1] font-semibold">
          {product ? "Edit Product" : "Add New Product"}
        </h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="gap-4 grid grid-cols-3 justify-center items-center"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      <SelectItem value={"single"}>Single</SelectItem>
                      <SelectItem value={"variable"}>Variable</SelectItem>
                      <SelectItem value={"combo"}>Combo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-3">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {locationsLoading && (
                        <>
                          {loadingData?.map((i) => (
                            <SelectItem key={i} value={String(i)}>
                              <Skeleton className="w-20 h-4 bg-[#F5F5F5]" />
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {locationsList &&
                        locationsList?.map((location: Location) => (
                          <SelectItem
                            key={location.id}
                            value={String(location.id)}
                          >
                            {location.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {categoriesLoading && (
                        <>
                          {loadingData?.map((i) => (
                            <SelectItem key={i} value={String(i)}>
                              <Skeleton className="w-20 h-4 bg-[#F5F5F5]" />
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {categoriesList &&
                        categoriesList?.map((category: Category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {brandsLoading && (
                        <>
                          {loadingData?.map((i) => (
                            <SelectItem key={i} value={String(i)}>
                              <Skeleton className="w-20 h-4 bg-[#F5F5F5]" />
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {brandsList &&
                        brandsList?.map((brand: Brand) => (
                          <SelectItem key={brand.id} value={String(brand.id)}>
                            {brand.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="barcode_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {barcodesLoading && (
                        <>
                          {loadingData?.map((i) => (
                            <SelectItem key={i} value={String(i)}>
                              <Skeleton className="w-20 h-4 bg-[#F5F5F5]" />
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {barcodesList &&
                        barcodesList?.map((barcode: Barcode) => (
                          <SelectItem
                            key={barcode.id}
                            value={String(barcode.id)}
                          >
                            {barcode.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {taxratesLoading && (
                        <>
                          {loadingData?.map((i) => (
                            <SelectItem key={i} value={String(i)}>
                              <Skeleton className="w-20 h-4 bg-[#F5F5F5]" />
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {taxratesList &&
                        taxratesList?.map((tax: Taxrate) => (
                          <SelectItem key={tax.id} value={String(tax.id)}>
                            {tax.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {unitsLoading && (
                        <>
                          {loadingData?.map((i) => (
                            <SelectItem key={i} value={String(i)}>
                              <Skeleton className="w-20 h-4 bg-[#F5F5F5]" />
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {unitsList &&
                        unitsList?.map((unit: Unit) => (
                          <SelectItem key={unit.id} value={String(unit.id)}>
                            {unit.actual_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tax_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Type</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      <SelectItem value={"inclusive"}>Inclusive</SelectItem>
                      <SelectItem value={"Exclusive"}>Exclusive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("type") === "single" && (
              <div className="col-span-3 grid grid-cols-5 gap-4">
                <FormField
                  control={form.control}
                  name="price_inclusive_tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Inclusive Tax</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_exclusive_tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Exclusive Tax</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="profit_margin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profit Margin</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="selling_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="selling_price_inc_tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selling Price Inc Tax</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {form.watch("type") === "variable" && (
              <>
                <FormField
                  control={form.control}
                  name="variation_id"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Variation</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {variationsLoading && (
                            <>
                              {loadingData?.map((i) => (
                                <SelectItem key={i} value={String(i)}>
                                  <Skeleton className="w-20 h-4 bg-[#F5F5F5]" />
                                </SelectItem>
                              ))}
                            </>
                          )}
                          {variationsList &&
                            variationsList?.map((variation: Variation) => (
                              <SelectItem
                                key={variation.id}
                                value={String(variation.id)}
                              >
                                {variation.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields?.map((field, index) => (
                  <VariationsInput key={field.id} index={index} form={form} />
                ))}
              </>
            )}

            <FileInput fileAllowed={1} onChange={handleFileSelect} />
            <FormField
              control={form.control}
              name="manage_stock_status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-4 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="mt-0!">Manage Stock</FormLabel>
                </FormItem>
              )}
            />

            {form.watch("manage_stock_status") && (
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="col-span-3 flex items-center justify-center">
              <Button disabled={createLoading} className="w-full" type="submit">
                {createLoading && (
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                )}
                {product ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default CreateProduct;
