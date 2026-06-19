import { create } from "zustand";

interface BookingDraft {
  merchantId: string | null;
  packageId: string | null;
  vehicleId: string | null;
  pickupDate: string | null;
  pickupSlot: string | null;
  pickupAddress: string | null;
  pickupCoords: { lat: number; lng: number } | null;
  driverNote: string;
}

interface BookingState extends BookingDraft {
  currentStep: number;
  setMerchant: (merchantId: string) => void;
  setPackage: (packageId: string) => void;
  setVehicle: (vehicleId: string | null) => void;
  setDateTime: (date: string, slot: string) => void;
  setAddress: (address: string, coords: { lat: number; lng: number }) => void;
  setDriverNote: (note: string) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const initialState: BookingDraft & { currentStep: number } = {
  merchantId: null,
  packageId: null,
  vehicleId: null,
  pickupDate: null,
  pickupSlot: null,
  pickupAddress: null,
  pickupCoords: null,
  driverNote: "",
  currentStep: 0,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,
  setMerchant: (merchantId) => set({ merchantId }),
  setPackage: (packageId) => set({ packageId }),
  setVehicle: (vehicleId) => set({ vehicleId }),
  setDateTime: (date, slot) => set({ pickupDate: date, pickupSlot: slot }),
  setAddress: (address, coords) =>
    set({ pickupAddress: address, pickupCoords: coords }),
  setDriverNote: (driverNote) => set({ driverNote }),
  setStep: (currentStep) => set({ currentStep }),
  reset: () => set(initialState),
}));
