import { RadarMap } from '../../components/RadarMap';
import { LeftPanel } from './components/LeftPanel';

const Radar = () => {
    return (
        <div className="absolute inset-0">
            <RadarMap />
            <LeftPanel />
            {/* Right HUD panel */}
            <aside className="absolute top-10 right-4 bottom-10 w-72 bg-black/50 backdrop-blur rounded-xl border border-slate-700 overflow-y-auto z-10" />
        </div>
    );
};

export default Radar;