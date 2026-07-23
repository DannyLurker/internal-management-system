"use client";

import { useState } from "react";
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
    const totalPages = pagination?.totalPages || 1;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;

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
                <table className="w-full text-left font-ochre-ui text-sm border-collapse min-w-180">
                    <thead>
                        <tr className="border-b border-[#eef4ff] text-[#565e74] uppercase tracking-wider text-[11px] font-semibold bg-white">
                            <th className="px-6 py-4 font-semibold text-[#524439]">Item Name</th>
                            <th className="px-6 py-4 font-semibold text-[#524439]">Status</th>
                            <th className="px-6 py-4 text-right font-semibold text-[#524439]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="border-b border-[#eef4ff] bg-white">
                                    <td className="px-6 py-3" colSpan={3}>
                                        <div className="h-10 animate-pulse rounded-md bg-[#eef4ff]/80" />
                                    </td>
                                </tr>
                            ))
                        ) : expiredStocks.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-[#524439] bg-white">
                                    No expired stocks found.
                                </td>
                            </tr>
                        ) : (
                            expiredStocks.map((item) => (
                                <tr key={item.id} className="border-b border-[#eef4ff] hover:bg-[#f8f9ff]/50 bg-white transition-colors">
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
            {(!isLoading && totalItems > 0) && (
                <div className={dashboardStyles.paginationContainer}>
                    <p>
                        Showing {" "}
                        <span className="font-semibold text-[#121c28]">{startCount}</span>{" "}
                        to{" "}
                        <span className="font-semibold text-[#121c28]">{endCount}</span>{" "}
                        of{" "}
                        <span className="font-semibold text-[#121c28]">{totalItems}</span>{" "}
                        items
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={!hasPrevPage}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className={dashboardStyles.paginationTextButton}
                        >
                            Prev
                        </button>
                        <span className={dashboardStyles.paginationActiveIndicator}>
                            {page}
                        </span>
                        <button
                            type="button"
                            disabled={!hasNextPage}
                            onClick={() => setPage(p => p + 1)}
                            className={dashboardStyles.paginationTextButton}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
