import { useCallback, useState } from "react";
import { TextInput } from "../../../../../components/TextInput";
import { useAppStore } from "../../../../../store";

const PlannerInputControls = () => {
    const [startLocation, setStartLocation] = useState<string>("");
    const [endLocation, setEndLocation] = useState<string>("");

    const setPlannedRoute = useAppStore((s) => s.setPlannedRoute);

    const handleStartLocationChange = useCallback((value: string) => {
        setStartLocation(value);
    }, []);

    const handleEndLocationChange = useCallback((value: string) => {
        setEndLocation(value);
    }, []);

    const handleSubmit = useCallback(() => {
        if (!startLocation.trim() || !endLocation.trim()) return;
        setPlannedRoute({ startPlace: startLocation, endPlace: endLocation, bikeType: '' });
    }, [startLocation, endLocation, setPlannedRoute]);

    return (
        <div className="flex flex-col gap-4 justify-start items-start">
            <TextInput
                inputName="Start Location"
                placeholder="Enter start location"
                value={startLocation}
                onChange={handleStartLocationChange}
            />
            <TextInput
                inputName="End Location"
                placeholder="Enter end location"
                value={endLocation}
                onChange={handleEndLocationChange}
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