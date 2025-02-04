import { create } from "zustand";

interface ImportStore {
  data: any[];
  setData: (data: any[]) => void;
}

export const useImportStore = create<ImportStore>((set) => ({
  data: [],
  setData: (data) => set({ data }),
}));