import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api.js";
import { Product, Supplier, SupplierOffer } from "../types/api.js";

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  categories: string[];
}

export interface SuppliersResponse {
  suppliers: Supplier[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const catalogApi = {
  getProducts: (params?: { page?: number; limit?: number; q?: string; category?: string }) =>
    apiClient.get<unknown, ProductsResponse>("/products", { params }),

  getProduct: (id: string) =>
    apiClient.get<unknown, { product: Product; offers: SupplierOffer[] }>(`/products/${id}`),

  getSuppliers: (params?: { page?: number; limit?: number; city?: string; minReliability?: number }) =>
    apiClient.get<unknown, SuppliersResponse>("/suppliers", { params }),

  getSupplier: (id: string) =>
    apiClient.get<unknown, { supplier: Supplier; offers: SupplierOffer[] }>(`/suppliers/${id}`),
};

export function useProducts(params?: { page?: number; limit?: number; q?: string; category?: string }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => catalogApi.getProducts(params),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => catalogApi.getProduct(id),
    enabled: Boolean(id),
  });
}

export function useSuppliers(params?: { page?: number; limit?: number; city?: string; minReliability?: number }) {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => catalogApi.getSuppliers(params),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => catalogApi.getSupplier(id),
    enabled: Boolean(id),
  });
}
