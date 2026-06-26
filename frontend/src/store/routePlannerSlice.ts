import { StateCreator } from 'zustand';
import { AppState, RoutePlannerState } from './types';
import { BikeType } from '../graphql/generated';

export const createRoutePlannerSlice: StateCreator<AppState, [], [], RoutePlannerState> = (set, get) => ({
    selectedItem: null,
    setSelectedItem: (selectedItem) => set({ selectedItem }, false),

    plannedRouteStart: null,
    setPlannedRouteStart: (value) => set({ plannedRouteStart: value }, false),
    plannedRouteEnd: null,
    setPlannedRouteEnd: (value) => set({ plannedRouteEnd: value }, false),
    plannedRouteBikeType: BikeType.Supersport,
    setPlannedRouteBikeType: (value) => set({ plannedRouteBikeType: value }, false),

    submittedRoute: null,
    submitRoute: () => {
        const { plannedRouteStart, plannedRouteEnd, plannedRouteBikeType } = get();
        if (!plannedRouteStart || !plannedRouteEnd) return;
        set({ submittedRoute: { startPlace: plannedRouteStart, endPlace: plannedRouteEnd, bikeType: plannedRouteBikeType } }, false);
    },
    clearRoute: () => set({
        plannedRouteStart: null,
        plannedRouteEnd: null,
        plannedRouteBikeType: BikeType.Commuter,
        submittedRoute: null,
    }, false),
})
