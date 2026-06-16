import { BikeType, PlaceAutocompleteResult } from "../graphql/generated";

export type Scenario = 'plan-route' | 'rides-soon' | 'where-ride';

export type SelectedItem =
    | { type: 'hazard'; id: string }
    | { type: 'poi'; id: string }
    | { type: 'ride'; id: string };

export interface PlannedRoute {
    startPlace: PlaceAutocompleteResult | null;
    endPlace: PlaceAutocompleteResult | null;
    bikeType: BikeType;
}

export interface RoutePlannerState {
    selectedItem: SelectedItem | null;
    setSelectedItem: (item: SelectedItem | null) => void;
    plannedRoute: PlannedRoute | null;
    setPlannedRoute: (values: Partial<PlannedRoute>) => void;
    clearRoute: () => void;
}

export type AppState = RoutePlannerState & {
    scenario: Scenario;
    setScenario: (s: Scenario) => void;
}
