import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../../services/apiClient';

const ProtectedRoute = () => {
    const location = useLocation();
    
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    
    const user = authService.getCurrentUser();
    const isSetupRoute = location.pathname.startsWith('/setup');
    
    if (user) {
        // If setup IS complete, they shouldn't be allowed back in /setup
        if (user.isSetupComplete && isSetupRoute) {
            return <Navigate to="/app/dashboard" replace />;
        }
    }
    
    return <Outlet />;
};

export default ProtectedRoute;
