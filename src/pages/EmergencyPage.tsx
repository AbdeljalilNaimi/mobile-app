import { Navigate } from "react-router-dom";

// Legacy redirect to new unified map architecture
const EmergencyPage = () => <Navigate to="/map?mode=emergency" replace />;

export default EmergencyPage;
