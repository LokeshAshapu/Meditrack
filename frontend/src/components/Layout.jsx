
import React from 'react';
import ThreeBackground from './ThreeBackground';
import NavBar from './NavBar';
import MedicalFooter from './MedicalFooter';
import { useLocation } from 'react-router-dom';

import ChatAssistant from './ChatAssistant';

const Layout = ({ children }) => {
    const location = useLocation();
    const hideNavAndFooterRoutes = ["/", "/login", "/signup"];
    const shouldHide = hideNavAndFooterRoutes.includes(location.pathname);

    return (
        <div className="relative min-h-screen font-sans antialiased bg-background text-foreground transition-colors duration-500 selection:bg-cyan-500/30">
            <ThreeBackground />
            <div className="relative z-10 flex flex-col min-h-screen">
                {!shouldHide && <NavBar />}
                <main className={`flex-1 flex flex-col ${!shouldHide ? 'pt-20' : ''}`}>
                    {children}
                </main>
                {!shouldHide && <MedicalFooter />}
            </div>

            {/* Global Chat Assistant (Only show when Nav is shown, or maybe always? Let's hide on Login/Signup to focus user) */}
            {!shouldHide && <ChatAssistant />}
        </div>
    );
};

export default Layout;
