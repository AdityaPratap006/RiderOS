import { RadarMap } from '../../components/RadarMap';
import { LeftPanel } from './components/LeftPanel';
import RightPanel from './components/RightPanel';

const Radar = () => {
    return (
        <div className="absolute inset-0">
            <RadarMap />
            <LeftPanel />
            <RightPanel />
        </div>
    );
};

export default Radar;