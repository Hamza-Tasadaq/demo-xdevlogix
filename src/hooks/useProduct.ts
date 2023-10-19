import { Product } from "@/views/products-list";
import { create } from "zustand";

interface IProduct {
  product: Product | null;
  setProduct: (arg: Product) => void;
}

const useProduct = create<IProduct>((set) => ({
  product: null,
  setProduct: (product) => set({ product }),
  clearProduct: () => set({ product: null }),
}));

export default useProduct;
