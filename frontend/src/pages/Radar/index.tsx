import { RadarMap } from '../../components/radar/RadarMap';

const Radar = () => {
    return (
        <div className="absolute inset-0">
            <RadarMap />
            {/* Left HUD panel */}
            <aside className="absolute top-20 left-4 bottom-4 w-72 bg-black/50 backdrop-blur rounded-xl border border-slate-700 overflow-y-auto" />
            {/* Right HUD panel */}
            <aside className="absolute top-20 right-4 bottom-4 w-72 bg-black/50 backdrop-blur rounded-xl border border-slate-700 overflow-y-auto" />
        </div>
    );
};

export default Radar;