"use client";

import { dashboardStyles } from "../dashboard.styles";

export default function DashboardHeader() {
    return (
        <div className={dashboardStyles.headerContainer}>
            <h1 className={dashboardStyles.headerTitle}>Dashboard</h1>
        </div>
    );
}
