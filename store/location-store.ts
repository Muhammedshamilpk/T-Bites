import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DeliveryLocation {
  address: string;
  city: string;
  pincode?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isSet: boolean;
}

interface LocationStore {
  location: DeliveryLocation;
  isModalOpen: boolean;
  setLocation: (loc: Partial<DeliveryLocation>) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      location: {
        address: "",
        city: "",
        pincode: "",
        isSet: false, // Triggers location modal on first visit if false
      },
      isModalOpen: false,
      setLocation: (loc) =>
        set((state) => ({
          location: { ...state.location, ...loc, isSet: true },
          isModalOpen: false,
        })),
      openModal: () => set({ isModalOpen: true }),
      closeModal: () => set({ isModalOpen: false }),
    }),
    {
      name: "tbites-delivery-location-v2",
    }
  )
);
