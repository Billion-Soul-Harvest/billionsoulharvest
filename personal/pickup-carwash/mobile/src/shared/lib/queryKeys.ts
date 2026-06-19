export const queryKeys = {
  merchants: {
    nearby: (lat: number, lng: number, radius: number) =>
      ["merchants", "nearby", { lat, lng, radius }] as const,
    detail: (id: string) => ["merchants", id] as const,
    packages: (id: string) => ["merchants", id, "packages"] as const,
    reviews: (id: string) => ["merchants", id, "reviews"] as const,
    slots: (id: string, date: string) =>
      ["merchants", id, "slots", date] as const,
  },
  bookings: {
    all: () => ["bookings"] as const,
    detail: (id: string) => ["bookings", id] as const,
  },
  profile: () => ["profile"] as const,
  vehicles: () => ["vehicles"] as const,
};
