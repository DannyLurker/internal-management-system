"use client";

import React, { useState } from "react";
import { dashboardStyles } from "../dashboard.styles";
import { useManagerDashboard } from "../dashboard.hooks";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export default function FlaggedExpiredTable() {
    const [page, setPage] = useState(1);
    const dataPerPage = 10;

    const { data, isLoading } = useManagerDashboard({
        lowStockAlertPage: 1,
        lowStockAlertDataPerPage: 10,
        flaggedExpiredStockPage: page,
        flaggedExpiredStockDataPerPage: dataPerPage,
    });

    const expiredStocks = data?.data?.data?.flaggedExpiredStocks?.items || [];
    const pagination = data?.data?.data?.flaggedExpiredStocks?.pagination;
    const totalItems = pagination?.totalItems || 0;

    const startCount = (page - 1) * dataPerPage + 1;
    const endCount = Math.min(page * dataPerPage, totalItems);

    return (
        <div className={dashboardStyles.tableCard}>
            <div className={dashboardStyles.tableHeader}>
                <div className="flex items-center gap-3">
                    <h2 className={dashboardStyles.tableTitle}>Flagged Expired Stocks</h2>
                </div>
                <Calendar className="w-5 h-5 text-[#565e74]" strokeWidth={1.5} />
            </div>

            <div className="w-full overflow-x-auto">
                <table className="w-full text-left font-sans text-sm pb-4">
                    <thead>
                        <tr className="border-b border-[#F5F2ED] text-[#565e74] uppercase tracking-wider text-[11px] font-semibold">
                            <th className="px-6 py-4">Item Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="border-b border-[#F5F2ED]/50 animate-pulse">
                                    <td className="px-6 py-4"><div className="h-4 bg-[#F5F2ED] rounded w-3/4"></div></td>
                                    <td className="px-6 py-4"><div className="h-5 bg-[#F5F2ED] rounded w-16"></div></td>
                                    <td className="px-6 py-4"><div className="h-4 bg-[#F5F2ED] rounded w-12 ml-auto"></div></td>
                                </tr>
                            ))
                        ) : expiredStocks.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-[#565e74]">
                                    No expired stocks found.
                                </td>
                            </tr>
                        ) : (
                            expiredStocks.map((item) => (
                                <tr key={item.id} className="border-b border-[#F5F2ED] hover:bg-[#F8F9FF] transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#121c28]">{item.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={cn(dashboardStyles.statusPill, dashboardStyles.criticalStatus)}>
                                            EXPIRED
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
                <span>
                    Showing {totalItems === 0 ? 0 : startCount} to {endCount} of {totalItems}
                </span>
                <div className="flex gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="p-1 rounded hover:bg-[#F5F2ED] disabled:opacity-50 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        disabled={page >= (pagination?.totalPages || 1)}
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
