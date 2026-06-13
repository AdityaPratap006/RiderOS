import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type Scenario = 'plan-route' | 'rides-soon' | 'where-ride';

export type SelectedItem =
  | { type: 'hazard'; id: string }
  | { type: 'poi'; id: string }
  | { type: 'ride'; id: string };

export interface PlannedRoute {
  startPlace: string;
  endPlace: string;
  bikeType: string;
}

interface AppState {
  scenario: Scenario;
  setScenario: (s: Scenario) => void;

  selectedItem: SelectedItem | null;
  setSelectedItem: (item: SelectedItem | null) => void;

  plannedRoute: PlannedRoute | null;
  setPlannedRoute: (values: PlannedRoute) => void;
  clearRoute: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      scenario: 'plan-route',
      setScenario: (scenario) => set({ scenario }, false, 'setScenario'),

      selectedItem: null,
      setSelectedItem: (selectedItem) => set({ selectedItem }, false, 'setSelectedItem'),

      plannedRoute: null,
      setPlannedRoute: (values) => set({ plannedRoute: values }, false, 'setPlannedRoute'),
      clearRoute: () => set({ plannedRoute: null }, false, 'clearRoute'),
    }),
    { name: 'RiderOS' },
  ),
);
