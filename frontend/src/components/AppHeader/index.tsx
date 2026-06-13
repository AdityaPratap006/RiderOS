import { NavLink } from "react-router"
import { HUDPanel } from "../HUDPanel"
import { APP_ROUTES } from "../../configs/routes"

const StyledNavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
    return (
        <NavLink
            to={to}
            className={
                ({ isActive }) => `px-3 py-1 rounded-lg hover:bg-accent hover:bg-opacity-15 transition-colors ${isActive ? 'text-accent' : ''}`
            }
        >
            {children}
        </NavLink>
    )
}

export const AppHeader = () => {
    return (
        <HUDPanel className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[60%]">
            <div className="flex justify-between items-center gap-3 p-3">
                <h1 className="text-2xl font-bold text-accent">RiderOS</h1>
                <div className="flex gap-2">
                    <StyledNavLink to={APP_ROUTES.RADAR}>
                        Radar
                    </StyledNavLink>
                    <StyledNavLink to={APP_ROUTES.PROFILE}>
                        Profile
                    </StyledNavLink>
                </div>
            </div>
        </HUDPanel>
    )
}