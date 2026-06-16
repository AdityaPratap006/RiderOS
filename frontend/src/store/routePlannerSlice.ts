import { StateCreator } from 'zustand';
import { AppState, RoutePlannerState } from './types';
import { BikeType } from '../graphql/generated';


export const createRoutePlannerSlice: StateCreator<AppState, [], [], RoutePlannerState> = (set) => ({
    selectedItem: null,
    setSelectedItem: (selectedItem) => set({ selectedItem }, false),
    plannedRoute: null,
    setPlannedRoute: (values) => set(state => ({
        plannedRoute: {
            startPlace: values.startPlace ?? state.plannedRoute?.startPlace ?? null,
            endPlace: values.endPlace ?? state.plannedRoute?.endPlace ?? null,
            bikeType: values.bikeType ?? state.plannedRoute?.bikeType ?? BikeType.AdventureTourerHighway
        }
    }), false),
    clearRoute: () => set({ plannedRoute: null }, false),
})