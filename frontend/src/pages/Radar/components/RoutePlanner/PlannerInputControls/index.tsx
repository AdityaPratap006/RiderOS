import { useCallback } from "react";
import { useAppStore } from "../../../../../store";
import { BikeType, PlaceAutocompleteResult } from "../../../../../graphql/generated";
import { SelectInput } from "../../../../../components/SelectInput";
import PlaceAutocompleteInput from "../../../../../components/PlaceAutocompleteInput";

const BIKE_TYPES: BikeType[] = Object.values(BikeType);

const PlannerInputControls = () => {
    const plannedRouteStart = useAppStore((s) => s.plannedRouteStart);
    const plannedRouteEnd = useAppStore((s) => s.plannedRouteEnd);
    const plannedRouteBikeType = useAppStore((s) => s.plannedRouteBikeType);
    const setPlannedRouteStart = useAppStore((s) => s.setPlannedRouteStart);
    const setPlannedRouteEnd = useAppStore((s) => s.setPlannedRouteEnd);
    const setPlannedRouteBikeType = useAppStore((s) => s.setPlannedRouteBikeType);
    const submitRoute = useAppStore((s) => s.submitRoute);

    const handleStartLocationChange = useCallback((value: PlaceAutocompleteResult) => {
        setPlannedRouteStart(value);
    }, [setPlannedRouteStart]);

    const handleEndLocationChange = useCallback((value: PlaceAutocompleteResult) => {
        setPlannedRouteEnd(value);
    }, [setPlannedRouteEnd]);

    const handleBikeTypeChange = useCallback((value: BikeType) => {
        setPlannedRouteBikeType(value);
    }, [setPlannedRouteBikeType]);

    const handleSubmit = useCallback(() => {
        if (!plannedRouteStart || !plannedRouteEnd) return;
        submitRoute();
    }, [plannedRouteStart, plannedRouteEnd, submitRoute]);

    return (
        <div className="flex flex-col gap-4 justify-start items-start">
            <PlaceAutocompleteInput
                inputName="Start Location"
                onSelect={handleStartLocationChange}
            />
            <PlaceAutocompleteInput
                inputName="End Location"
                onSelect={handleEndLocationChange}
            />
            <SelectInput
                inputName="Bike Type"
                options={BIKE_TYPES}
                value={plannedRouteBikeType}
                onChange={(value) => handleBikeTypeChange(value as BikeType)}
                placeholder="Select bike type"
            />
            <button
                onClick={handleSubmit}
                className="
                    mt-4 w-full py-2 rounded-lg
                    text-sm font-medium border border-accent/60
                    bg-surface/60 text-accent
                    hover:bg-accent hover:text-surface transition-colors
                "
            >
                Check Route Readiness!
            </button>
        </div>
    );
};

export default PlannerInputControls;
