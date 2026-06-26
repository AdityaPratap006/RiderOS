import { BikeType, PlaceAutocompleteResult } from "../graphql/generated";

export type Scenario = 'plan-route' | 'rides-soon' | 'where-ride';

export type SelectedItem =
    | { type: 'hazard'; id: string }
    | { type: 'poi'; id: string }
    | { type: 'ride'; id: string };

export interface SubmittedRoute {
    startPlace: PlaceAutocompleteResult;
    endPlace: PlaceAutocompleteResult;
    bikeType: BikeType;
}

export interface RoutePlannerState {
    selectedItem: SelectedItem | null;
    setSelectedItem: (item: SelectedItem | null) => void;

    plannedRouteStart: PlaceAutocompleteResult | null;
    setPlannedRouteStart: (value: PlaceAutocompleteResult | null) => void;
    plannedRouteEnd: PlaceAutocompleteResult | null;
    setPlannedRouteEnd: (value: PlaceAutocompleteResult | null) => void;
    plannedRouteBikeType: BikeType;
    setPlannedRouteBikeType: (value: BikeType) => void;

    submittedRoute: SubmittedRoute | null;
    submitRoute: () => void;
    clearRoute: () => void;
}

export type AppState = RoutePlannerState & {
    scenario: Scenario;
    setScenario: (s: Scenario) => void;
}
