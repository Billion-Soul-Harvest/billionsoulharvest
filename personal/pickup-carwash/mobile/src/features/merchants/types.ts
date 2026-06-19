export interface MerchantFilters {
  radius: number;
  minRating?: number;
  maxPrice?: number;
}

export const DEFAULT_FILTERS: MerchantFilters = {
  radius: 10,
};
