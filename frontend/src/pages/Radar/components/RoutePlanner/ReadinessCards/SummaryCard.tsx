import { HUDPanel } from "../../../../../components/HUDPanel";
import type { RouteReadinessData } from "../../../../../hooks/useRouteReadiness";

interface SummaryCardProps {
    overallStatus: RouteReadinessData['overallStatus'];
    summary: RouteReadinessData['summary'];
    suggestedBikes: RouteReadinessData['suggestedBikes'];
    bikeFitAnalysis: RouteReadinessData['bikeFitAnalysis'];
}

const STATUS_STYLE: Record<string, string> = {
    good: 'text-green-400 border-green-400/40 bg-green-400/10',
    caution: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
    risky: 'text-red-400 border-red-400/40 bg-red-400/10',
};

type BikeFitTag = "ideal" | "suitable" | "manageable" | "not_recommended"

const FIT_STYLE: Record<BikeFitTag, string> = {
    ideal: 'text-green-400 border-green-400/40 bg-green-400/10',
    suitable: 'text-blue-400 border-blue-400/40 bg-blue-400/10',
    manageable: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10',
    not_recommended: 'text-red-400 border-red-400/40 bg-red-400/10',
};

const FIT_TEXT_STYLE: Record<BikeFitTag, string> = {
    ideal: 'text-green-400',
    suitable: 'text-blue-400',
    manageable: 'text-yellow-400',
    not_recommended: 'text-red-400',
};

const FIT_LABEL: Record<BikeFitTag, string> = {
    ideal: 'Ideal',
    suitable: 'Suitable',
    manageable: 'Manageable',
    not_recommended: 'Not Recommended',
};



const SummaryCard = ({ overallStatus, summary, suggestedBikes, bikeFitAnalysis }: SummaryCardProps) => {
    const statusStyle = STATUS_STYLE[overallStatus.toLowerCase()] ?? STATUS_STYLE.caution;

    return (
        <HUDPanel className="w-full p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text font-semibold text-white">Route Readiness</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full border capitalize ${statusStyle}`}>
                    {overallStatus}
                </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{summary}</p>

            {bikeFitAnalysis && (
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-200">Your Bike Fit</span>
                        <span className={
                            `text-xs font-medium px-2 py-0.5 rounded-full border 
                            ${FIT_STYLE[bikeFitAnalysis.fit as BikeFitTag] ?? FIT_STYLE.manageable}`
                        }>
                            {FIT_LABEL[bikeFitAnalysis.fit as BikeFitTag] ?? bikeFitAnalysis.fit}
                        </span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-700">
                            <div
                                className="h-1.5 rounded-full bg-accent transition-all duration-500"
                                style={{ width: `${bikeFitAnalysis.score}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{bikeFitAnalysis.score}/100</span>
                    </div>
                    <p className={
                        `text-xs 
                        ${FIT_TEXT_STYLE[bikeFitAnalysis.fit as BikeFitTag] ?? FIT_TEXT_STYLE.manageable}`
                    }>
                        {bikeFitAnalysis.note}
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <span className="text-sm text-gray-200">Suggested Bikes:</span>
                {suggestedBikes.map((s) => (
                    <div key={s.bikeType} className="flex flex-col gap-0.5 rounded bg-accent/5 p-2">
                        <span className="text-sm text-accent font-medium">{s.bikeType}</span>
                        <span className="text-xs text-gray-400">{s.reason}</span>
                    </div>
                ))}
            </div>
        </HUDPanel>
    );
};

export default SummaryCard;

export const SummayCardShimmer = () => (
    <HUDPanel className="w-full p-4 flex flex-col gap-3 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="h-4 w-32 rounded bg-gray-700" />
            <div className="h-5 w-16 rounded-full bg-gray-700" />
        </div>
        <div className="flex flex-col gap-2">
            <div className="h-3 w-full rounded bg-gray-700" />
            <div className="h-3 w-4/5 rounded bg-gray-700" />
            <div className="h-3 w-3/5 rounded bg-gray-700" />
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
            <div className="h-3 w-20 rounded bg-gray-700" />
            <div className="h-3 w-24 rounded bg-gray-700" />

            <div className="h-3 w-20 rounded bg-gray-700" />
            <div className="h-3 w-24 rounded bg-gray-700" />

            <div className="h-3 w-20 rounded bg-gray-700" />
            <div className="h-3 w-24 rounded bg-gray-700" />

            <div className="h-3 w-20 rounded bg-gray-700" />
            <div className="h-3 w-24 rounded bg-gray-700" />
        </div>
    </HUDPanel>
);
