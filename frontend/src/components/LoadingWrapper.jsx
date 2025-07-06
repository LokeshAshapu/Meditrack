import React, { useEffect, useState } from "react";
import SpinnerLoading from "./spinnerLoading";
import { useLocation } from "react-router-dom";

function LoadingWrapper({ children }) {
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return loading ? <SpinnerLoading /> : <>{children}</>;
}

export default LoadingWrapper;
