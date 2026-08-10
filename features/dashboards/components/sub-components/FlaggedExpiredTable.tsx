"use client";

import { useState } from "react";
import { dashboardStyles } from "../../dashboard.styles";
import { Calendar } from "lucide-react";
import { formatItemDate } from "@/shared/lib/formatter";
import StockInfoPanel from "@/features/stocks/components/sub-components/stock-table/StockInfoPanel";
import { useFinancialSummary } from "../../dashboard.hooks";
import { FlaggedExpiredStockItem } from "../../dashboard.types";

export default function FlaggedExpiredTable() {
  const [page, setPage] = useState(1);
  const dataPerPage = 10;
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const { data, isLoading } = useFinancialSummary({
    lowStockAlertPage: 1,
    lowStockAlertDataPerPage: 10,
    flaggedExpiredStockPage: page,
    flaggedExpiredStockDataPerPage: dataPerPage,
  });

  const expiredStocks =
    data?.flaggedExpiredStocks?.flaggedExpiredStockData || [];
  const totalItems = data?.flaggedExpiredStocks?.totalExpiredCount || 0;
  const totalPages = Math.ceil(totalItems / dataPerPage) || 1;
  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;

  const startCount = (page - 1) * dataPerPage + 1;
  const endCount = Math.min(page * dataPerPage, totalItems);

  return (
    <>
      <div className={dashboardStyles.tableCard}>
        <div className={dashboardStyles.tableHeader}>
          <div className="flex gap-3 flex-col">
            <h2 className={dashboardStyles.tableTitle}>
              Flagged Expired Stocks
            </h2>
            <p>
              These stocks have reached their expiration date, but their status
              has not been updated yet.
            </p>
          </div>
          <Calendar className="w-5 h-5 text-[#565e74]" strokeWidth={1.5} />
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left font-ochre-ui text-sm border-collapse min-w-180">
            <thead>
              <tr className="border-b border-[#eef4ff] text-[#565e74] uppercase tracking-wider text-[11px] font-semibold bg-white">
                <th className="px-6 py-4 font-semibold text-[#524439]">
                  Item Name
                </th>
                <th className="px-6 py-4 font-semibold text-[#524439]">
                  Location
                </th>
                <th className="px-6 py-4 font-semibold text-[#524439]">
                  Expired At
                </th>
                <th className="px-6 py-4 font-semibold text-[#524439]">
                  Quantity
                </th>
                <th className="px-6 py-4 text-right font-semibold text-[#524439]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#eef4ff] bg-white">
                    <td className="px-6 py-3" colSpan={3}>
                      <div className="h-10 animate-pulse rounded-md bg-[#eef4ff]/80" />
                    </td>
                  </tr>
                ))
              ) : expiredStocks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-[#524439] bg-white"
                  >
                    No expired stocks found.
                  </td>
                </tr>
              ) : (
                expiredStocks.map(
                  (item: FlaggedExpiredStockItem, i: number) => (
                    <tr
                      key={item.id + i}
                      className="border-b border-[#eef4ff] hover:bg-[#f8f9ff]/50 bg-white transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-[#121c28]">
                        {item.item?.name}
                      </td>
                      <td className="px-6 py-4">{item.location?.name}</td>
                      <td className="px-6 py-4">
                        {item.expiredAt ? formatItemDate(item.expiredAt) : "-"}
                      </td>
                      <td className="px-6 py-4">{item.quantity}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className={dashboardStyles.actionText}
                          onClick={() => {
                            setSelectedStockId(item.id);
                            setPanelOpen(true);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ),
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination component */}
        {!isLoading && totalItems > 0 && (
          <div className={dashboardStyles.paginationContainer}>
            <p>
              Showing{" "}
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
                disabled={!hasNextPage}
                onClick={() => setPage((p) => p + 1)}
                className={dashboardStyles.paginationTextButton}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <StockInfoPanel
        open={panelOpen}
        stockId={selectedStockId ?? ""}
        onClose={() => {
          setPanelOpen(false);
          setSelectedStockId(null);
        }}
      />
    </>
  );
}
