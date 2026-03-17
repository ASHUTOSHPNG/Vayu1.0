import { create } from 'zustand';
import { UserProfile } from '../types';
import { AdminContext } from '../types/admin';

interface AdminState {
    adminContext: AdminContext | null;
    profile: UserProfile | null;
    selectedCityId: string | null; // For Super Admins to filter individual cities
    setAdminContext: (context: AdminContext | null, profile: UserProfile | null) => void;
    setSelectedCityId: (cityId: string | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
    adminContext: null,
    profile: null,
    selectedCityId: null,
    setAdminContext: (adminContext, profile) => set({ adminContext, profile }),
    setSelectedCityId: (selectedCityId) => set({ selectedCityId }),
}));
