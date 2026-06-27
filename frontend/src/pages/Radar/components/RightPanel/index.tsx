import ReadinessCards from "../RoutePlanner/ReadinessCards"

const RightPanel = () => {
    return (
        <aside className="absolute top-10 right-4 bottom-10 w-72 overflow-y-auto z-10 flex flex-col" >
            <ReadinessCards />
        </aside>
    )
}

export default RightPanel