"use client";

import { useState } from "react";
import { dashboardStyles } from "../../dashboard.styles";
import { AlertCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useFinancialSummary } from "../../dashboard.hooks";
import { LowStockItem } from "../../dashboard.types";

export default function LowStockTable() {
  const [page, setPage] = useState(1);
  const dataPerPage = 10;

  const { data, isLoading } = useFinancialSummary({
    lowStockAlertPage: page,
    lowStockAlertDataPerPage: dataPerPage,
    flaggedExpiredStockPage: 1,
    flaggedExpiredStockDataPerPage: 10,
  });

  const lowStocks = data?.lowStockData || [];

  return (
    <div className={dashboardStyles.tableCard}>
      <div className={dashboardStyles.tableHeader}>
        <div className="flex items-center gap-3">
          <h2 className={dashboardStyles.tableTitle}>Low Stock Alerts</h2>
        </div>
        <AlertCircle className="w-5 h-5 text-[#565e74]" strokeWidth={1.5} />
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left font-ochre-ui text-sm border-collapse min-w-225">
          <thead>
            <tr className="border-b border-[#eef4ff] text-[#565e74] uppercase tracking-wider text-[11px] font-semibold bg-white">
              <th className="px-6 py-4 font-semibold text-[#524439]">
                Item Name
              </th>
              <th className="px-6 py-4 font-semibold text-[#524439]">
                Current
              </th>
              <th className="px-6 py-4 font-semibold text-[#524439]">Min</th>
              <th className="px-6 py-4 font-semibold text-[#524439]">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-[#eef4ff] bg-white">
                  <td className="px-6 py-3" colSpan={5}>
                    <div className="h-10 animate-pulse rounded-md bg-[#eef4ff]/80" />
                  </td>
                </tr>
              ))
            ) : lowStocks.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-[#524439] bg-white"
                >
                  No low stock items found.
                </td>
              </tr>
            ) : (
              lowStocks.map((item: LowStockItem) => (
                <tr
                  key={item.id}
                  className="border-b border-[#eef4ff] hover:bg-[#f8f9ff]/50 bg-white transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-[#121c28]">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-[#565e74]">
                    {item.currentStock}
                  </td>
                  <td className="px-6 py-4 text-[#565e74]">
                    {item.minThreshold}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        dashboardStyles.statusPill,
                        item.currentStock <= item.minThreshold / 2
                          ? dashboardStyles.criticalStatus
                          : dashboardStyles.lowStatus,
                      )}
                    >
                      {item.currentStock <= item.minThreshold / 2
                        ? "Critical"
                        : "Low"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination component */}
      <div className={dashboardStyles.paginationContainer}>
        <p>Showing low stock items</p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={dashboardStyles.paginationTextButton}
          >
            Prev
          </button>
          <span className={dashboardStyles.paginationActiveIndicator}>
            {page}
          </span>
          <button
            type="button"
            disabled={lowStocks.length < dataPerPage}
            onClick={() => setPage((p) => p + 1)}
            className={dashboardStyles.paginationTextButton}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
