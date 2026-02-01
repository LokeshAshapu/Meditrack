import React, { useEffect } from "react";
import { ThreeDots } from "react-loader-spinner";

function SpinnerLoading() {
    // Logic removed to make this a pure UI component


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <ThreeDots
                height="80"
                width="80"
                radius="9"
                color="SlateBlue"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClassName=""
                visible={true}
            />
        </div>
    );
}
export default SpinnerLoading;