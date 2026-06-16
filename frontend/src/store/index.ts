import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createRoutePlannerSlice } from './routePlannerSlice';
import { AppState } from './types';


export const useAppStore = create<AppState>()(
  devtools(
    (set, get, store) => ({
      scenario: 'plan-route',
      setScenario: (scenario) => set({ scenario }, false, 'setScenario'),
      ...createRoutePlannerSlice(set, get, store),
    }),
    { name: 'RiderOS' },
  ),
);
