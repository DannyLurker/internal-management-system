import { cn } from "@/shared/lib/utils";

export const dashboardStyles = {
    pageContainer: "min-h-screen bg-[#F5F2ED] p-6 lg:p-16", // Warm ivory background, generous whitespace
    headerContainer: "flex items-center justify-between mb-12",
    headerTitle: "font-serif text-4xl lg:text-5xl font-medium text-[#121c28]",
    headerActions: "flex items-center gap-6",

    kpiGrid: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-12",
    kpiCard: "bg-white rounded-[16px] p-6 flex flex-col justify-between shadow-[0_8px_30px_rgb(15,23,42,0.06)] hover:-translate-y-1 transition-transform duration-300",
    kpiLabelContainer: "flex justify-between items-center mb-4",
    kpiLabel: "font-sans uppercase tracking-[0.05em] text-xs font-semibold text-[#565e74]",
    kpiValue: "font-serif text-4xl lg:text-5xl text-[#121c28]",

    tableCard: "bg-white rounded-[16px] shadow-[0_8px_30px_rgb(15,23,42,0.06)] overflow-hidden mb-12",
    tableHeader: "px-6 py-5 border-b border-[#F5F2ED]/50 flex justify-between items-center bg-white",
    tableTitle: "font-serif text-2xl font-medium text-[#121c28]",

    statusPill: "px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase font-sans",
    criticalStatus: "bg-[#ffdad6] text-[#ba1a1a]", // Error container
    lowStatus: "bg-[#ffe0b2] text-[#e65100]", // Amber/Warning
    reviewStatus: "bg-[#dae2fd] text-[#565e74]", // Secondary container

    actionText: "text-[#894d0d] font-semibold text-xs tracking-wider uppercase hover:underline", // Primary Ochre
};
