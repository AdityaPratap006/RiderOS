import { HUDPanel } from "../../../../components/HUDPanel";
import PlannerInputControls from "../RoutePlanner/PlannerInputControls";

export const LeftPanel = () => {

    return (
        <HUDPanel className="absolute top-10 left-4 bottom-10 w-72 bg-opacity-70 z-10">
            <div className="w-full h-full p-2">
                <h2 className="text-xl font-semibold p-4">Route Planner</h2>
                <div className="border-b border-gray-300 w-full mt-4" />
                <div className="p-2 mt-4">
                    <PlannerInputControls />
                </div>
            </div>
        </HUDPanel>
    );
}