"use client";

import { useState } from "react";
import { dashboardStyles } from "../dashboard.styles";
import { useManagerDashboard } from "../dashboard.hooks";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export default function LowStockTable() {
    const [page, setPage] = useState(1);
    const dataPerPage = 10;

    const { data, isLoading } = useManagerDashboard({
        lowStockAlertPage: page,
        lowStockAlertDataPerPage: dataPerPage,
        flaggedExpiredStockPage: 1,
        flaggedExpiredStockDataPerPage: 10,
    });

    const lowStocks = data?.data?.data?.lowStocks || [];

    // Actually, since we combine the paginations in one query in the hook, 
    // changing one page param updates both. To truly decouple them normally we'd separate endpoints.
    // We'll manage just this table's section here. Since the endpoint handles both, we just extract lowStocks.
    // A skeleton while loading:

    return (
        <div className={dashboardStyles.tableCard}>
            <div className={dashboardStyles.tableHeader}>
                <div className="flex items-center gap-3">
                    <h2 className={dashboardStyles.tableTitle}>Low Stock Alerts</h2>
                </div>
                <AlertCircle className="w-5 h-5 text-[#565e74]" strokeWidth={1.5} />
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left font-sans text-sm pb-4">
                    <thead>
                        <tr className="border-b border-[#F5F2ED] text-[#565e74] uppercase tracking-wider text-[11px] font-semibold">
                            <th className="px-6 py-4">Item Name</th>
                            <th className="px-6 py-4">Current</th>
                            <th className="px-6 py-4">Min</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="border-b border-[#F5F2ED]/50 animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-[#F5F2ED] rounded w-3/4"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-[#F5F2ED] rounded w-8"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-[#F5F2ED] rounded w-8"></div></td>
                                    <td className="px-6 py-4"><div className="h-5 bg-[#F5F2ED] rounded w-16"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-[#F5F2ED] rounded w-12 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : lowStocks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-[#565e74]">
                                    No low stock items found.
                                </td>
                            </tr>
                        ) : (
                            lowStocks.map((item) => (
                                <tr key={item.id} className="border-b border-[#F5F2ED] hover:bg-[#F8F9FF] transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#121c28]">{item.name}</td>
                                    <td className="px-6 py-4 text-[#565e74]">{item.currentStock}</td>
                                    <td className="px-6 py-4 text-[#565e74]">{item.minThreshold}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            dashboardStyles.statusPill,
                                            item.currentStock <= item.minThreshold / 2
                                                ? dashboardStyles.criticalStatus
                                                : dashboardStyles.lowStatus
                                        )}>
                                            {item.currentStock <= item.minThreshold / 2 ? "Critical" : "Low"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className={dashboardStyles.actionText}>View Details</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination component */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-[#F5F2ED]/50 text-sm text-[#565e74]">
                <span>Showing low stock items</span>
                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="p-1 rounded hover:bg-[#F5F2ED] disabled:opacity-50 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        disabled={lowStocks.length < dataPerPage}
                        onClick={() => setPage(p => p + 1)}
                        className="p-1 rounded hover:bg-[#F5F2ED] disabled:opacity-50 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
