import { create } from 'zustand';

const useStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),

    portfolios: [],
    setPortfolios: (portfolios) => set({ portfolios }),

    currentJobGoal: '',
    setJobGoal: (goal) => set({ currentJobGoal: goal }),
}));

export default useStore;
