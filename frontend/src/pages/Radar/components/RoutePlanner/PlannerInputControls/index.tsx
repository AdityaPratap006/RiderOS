import { useCallback } from "react";
import { useAppStore } from "../../../../../store";
import { BikeType, PlaceAutocompleteResult } from "../../../../../graphql/generated";
import { SelectInput } from "../../../../../components/SelectInput";
import PlaceAutocompleteInput from "../../../../../components/PlaceAutocompleteInput";
import { useShallow } from "zustand/shallow";

const BIKE_TYPES: BikeType[] = Object.values(BikeType);

const PlannerInputControls = () => {

    const { setPlannedRoute, startLocation, endLocation, bikeType } = useAppStore(
        useShallow((s) => ({
            setPlannedRoute: s.setPlannedRoute,
            startLocation: s.plannedRoute?.startPlace,
            endLocation: s.plannedRoute?.endPlace,
            bikeType: s.plannedRoute?.bikeType,
        }))
    );

    const handleStartLocationChange = useCallback((value: PlaceAutocompleteResult) => {
        setPlannedRoute({ startPlace: value });
    }, []);

    const handleEndLocationChange = useCallback((value: PlaceAutocompleteResult) => {
        setPlannedRoute({ endPlace: value });
    }, []);

    const handleBikeTypeChange = useCallback((value: BikeType) => {
        setPlannedRoute({ bikeType: value });
    }, []);

    const handleSubmit = useCallback(() => {
        if (!startLocation || !endLocation) return;
        setPlannedRoute({ startPlace: startLocation, endPlace: endLocation, bikeType: bikeType });
    }, [startLocation, endLocation, bikeType, setPlannedRoute]);

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
                value={bikeType}
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