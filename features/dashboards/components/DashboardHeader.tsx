"use client";

import { dashboardStyles } from "../dashboard.styles";

export default function DashboardHeader() {
    return (
        <header className={dashboardStyles.headerContainer}>
            <div className="max-w-2xl">
                <h1 className={dashboardStyles.headerTitle}>Dashboard</h1>
                <p className="mt-2 font-ochre-brand text-sm italic leading-relaxed text-[#524439] md:text-base">
                    Monitor key performance indicators and critical stock alerts across your luxury properties.
                </p>
            </div>
            {/* The user profile and notification are usually in the global top bar in this codebase, but I'll add them if they specifically requested, or keep them omitted since their actual sidebar has the user profile */}
        </header>
    );
}
