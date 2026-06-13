import { Routes, Route } from "react-router";
import Radar from "./pages/Radar";
import { AppHeader } from "./components/AppHeader";
import { APP_ROUTES } from "./configs/routes";
 
export default function App() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Routes>
        <Route path={APP_ROUTES.RADAR} element={<Radar />} />
      </Routes>
      <AppHeader />
    </div>
  );
}
