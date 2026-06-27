import { useRouteReadiness } from "../../../../../hooks/useRouteReadiness";
import SummaryCard, { SummayCardShimmer } from "./SummaryCard";

const CONTAINER_STYLE = "flex flex-col gap-3 w-full";

const ReadinessCards = () => {
    const { data, loading, error } = useRouteReadiness();

    if (loading) return (
        <div className={CONTAINER_STYLE}>
            <SummayCardShimmer />
        </div>
    );
    if (error) return <p className="text-xs text-red-400">Failed to load route readiness.</p>;
    if (!data) return null;

    return (
        <div className={CONTAINER_STYLE}>
            <SummaryCard
                overallStatus={data.overallStatus}
                summary={data.summary}
                suggestedBikes={data.suggestedBikes}
                bikeFitAnalysis={data.bikeFitAnalysis ?? null}
            />
        </div>
    );
};

export default ReadinessCards;
