import { create } from "zustand";
import type { MerchantFilters } from "./types";

interface MerchantsState {
  filters: MerchantFilters;
  setFilters: (filters: Partial<MerchantFilters>) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: MerchantFilters = {
  radius: 10,
};

export const useMerchantsStore = create<MerchantsState>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
