import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { HiMenuAlt3 } from "react-icons/hi";

const DashbaordPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [sidebarOpen]);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Header with Hamburger Menu */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-200">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors duration-200"
                        aria-label="Toggle sidebar"
                    >
                        <HiMenuAlt3 className="h-6 w-6" />
                    </button>
                    <h1 className="text-lg md:text-xl font-semibold text-gray-900">Dashboard</h1>
                    <div className="w-10"></div> {/* Spacer for centering */}
                </div>
            </div>

            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static top-14 md:top-0 left-0 z-40 w-64 bg-[#212121] sidebar-transition h-[calc(100vh-3.5rem)] md:h-full`}>
                <Sidebar onClose={closeSidebar} />
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50 sidebar-overlay"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile content padding */}
                <div className="md:hidden h-14"></div>
                
                {/* Content Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashbaordPage;