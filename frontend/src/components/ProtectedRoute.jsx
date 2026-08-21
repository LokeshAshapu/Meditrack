import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
    const location = useLocation();
    const token = localStorage.getItem("authToken");
    const email = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole") || "patient";

    // Unauthenticated Check
    if (!token || !email || email === "undefined" || email === "null") {
        const fullPath = location.pathname + location.search;
        return <Navigate to={`/login?redirect=${encodeURIComponent(fullPath)}`} replace />;
    }

    // Role-Based Authorization Check
    if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(userRole)) {
        // Admin override for troubleshooting
        if (userRole !== 'admin') {
            return <Navigate to="/access-restricted" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;
