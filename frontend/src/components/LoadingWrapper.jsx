import React, { useEffect, useState } from "react";
import SpinnerLoading from "./spinnerLoading";
import { useLocation } from "react-router-dom";

function LoadingWrapper({ children }) {
    // Simply render children instantly. 
    // If global loading is needed later, we can add it here, 
    // but for now we want instant navigation as per user request.
    return <>{children}</>;
}

export default LoadingWrapper;
