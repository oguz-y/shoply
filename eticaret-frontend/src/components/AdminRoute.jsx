import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({children}) {
    const { user, isAdmin, authChecked } = useAuth();

    if (!authChecked) {
        return null;
    }
    if (!user || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default AdminRoute;