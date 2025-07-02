import React from "react";
import NavBar from "./NavBar";
import MedicalFooter from "./MedicalFooter";

function Dashboard() {
    return (
        <div>
            <NavBar />
            <div className="container mt-5">
                <p className="text-center">Welcome to your dashboard! Here you can manage your health records, track your medications, and more.</p>
            </div>
            <MedicalFooter />
        </div>
    );
}
export default Dashboard;