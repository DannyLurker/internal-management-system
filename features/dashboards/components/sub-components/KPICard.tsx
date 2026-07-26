"use client";

import React from "react";
import { dashboardStyles } from "../../dashboard.styles";

interface KPICardProps {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

export default function KPICard({
  label,
  description,
  value,
  icon,
}: KPICardProps) {
  return (
    <div className={dashboardStyles.kpiCard}>
      {/* Header Row: Label & Icon */}
      <div className={dashboardStyles.kpiLabelContainer}>
        <span className={dashboardStyles.kpiLabel}>{label}</span>
        <div className="text-[#894d0d] bg-[#F5F2ED] p-2 rounded-lg">{icon}</div>
      </div>

      {/* Main Value */}
      <div className={dashboardStyles.kpiValue}>{value}</div>

      {/* Enhanced Description Footer */}
      <p className={dashboardStyles.kpiDetail}>{description}</p>
    </div>
  );
}
