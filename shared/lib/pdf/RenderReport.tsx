import { GetFinancialSummaryServiceResult } from "@/features/dashboards/dashboard.types";
import { formatPrice } from "@/shared/lib/formatter";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#121c28",
  },

  // ── Top Accent Band & Header ─────────────────────────────────────────────
  topBar: {
    height: 4,
    backgroundColor: "#894d0d",
    marginBottom: 14,
    borderRadius: 2,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#894d0d",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 9,
    color: "#524439",
    fontStyle: "italic",
  },
  periodBadge: {
    backgroundColor: "#f8f9ff",
    borderWidth: 1,
    borderColor: "#d9e3f4",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: "flex-end",
  },
  periodLabel: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#894d0d",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  periodText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#121c28",
  },

  // ── Section Header ────────────────────────────────────────────────────────
  sectionHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#894d0d",
    marginBottom: 8,
    marginTop: 2,
    borderBottomWidth: 1,
    borderBottomColor: "#eef4ff",
    paddingBottom: 4,
    textTransform: "uppercase",
  },

  // ── KPI Summary Grid ─────────────────────────────────────────────────────
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  kpiCard: {
    // Change from "31%" to "15.8%" or similar to display all 6 KPIs across 1 row in landscape
    width: "15.8%",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d9e3f4",
    borderRadius: 6,
    padding: 8,
  },
  kpiLabel: {
    fontSize: 6.5,
    fontWeight: "bold",
    color: "#524439",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#894d0d",
  },

  // ── Table Card Section ─────────────────────────────────────────────────
  tableCard: {
    borderWidth: 1,
    borderColor: "#d9e3f4",
    borderRadius: 6,
    marginBottom: 14,
  },
  tableHeaderTitleContainer: {
    backgroundColor: "#f8f9ff",
    borderBottomWidth: 1,
    borderBottomColor: "#eef4ff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableHeaderTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#121c28",
  },
  tableHeaderBadge: {
    fontSize: 7,
    color: "#565e74",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#d9e3f4",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  colHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#524439",
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eef4ff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  rowEven: {
    backgroundColor: "#ffffff",
  },
  rowOdd: {
    backgroundColor: "#f8f9ff",
  },

  // Low Stock Table Columns
  colLowName: { flex: 4 },
  colLowCurrent: { flex: 2, textAlign: "right" },
  colLowMin: { flex: 2, textAlign: "right" },
  colLowStatus: { flex: 2, textAlign: "center" },

  // Expired Stock Table Columns
  colExpName: { flex: 4 },
  colExpLocation: { flex: 3 },
  colExpQty: { flex: 1.5, textAlign: "right" },
  colExpDate: { flex: 2.5, textAlign: "right" },

  // Text cell styles
  cellBoldText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#121c28",
  },
  cellMutedText: {
    fontSize: 8,
    color: "#565e74",
  },
  criticalStatusPill: {
    backgroundColor: "#ffdad6",
    color: "#ba1a1a",
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    textAlign: "center",
  },
  lowStatusPill: {
    backgroundColor: "#ffdcc2",
    color: "#894d0d",
    fontSize: 7,
    fontWeight: "bold",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    textAlign: "center",
  },
  emptyState: {
    padding: 12,
    textAlign: "center",
    color: "#524439",
    fontSize: 8,
  },

  // ── Footer ─────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#d9e3f4",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 7.5,
    color: "#565e74",
  },
});

function ReportDocument({
  data,
  dateFrom,
  dateTo,
}: {
  data: GetFinancialSummaryServiceResult;
  dateFrom: string;
  dateTo: string;
}) {
  const summary = data?.data;

  const totalValue = summary?.totalInventoryValue ?? 0;
  const totalSpend = summary?.totalSpend ?? 0;
  const totalWastage = summary?.totalStockWastageValue ?? 0;
  const totalConsume = summary?.totalConsume ?? 0;
  const totalSale = summary?.totalSale ?? 0;
  const totalLaundryOut = summary?.totalLaundryOutStock ?? 0;

  const lowStocks = summary?.lowStockData || [];
  const flaggedExpiredStocks =
    summary?.flaggedExpiredStocks?.flaggedExpiredStockData || [];

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Top Ochre Accent Band */}
        <View style={styles.topBar} />

        {/* Header Block */}
        <View style={styles.headerContainer}>
          <View style={styles.titleWrapper}>
            <Text style={styles.headerTitle}>Financial Summary</Text>
          </View>
          <View style={styles.periodBadge}>
            <Text style={styles.periodLabel}>Report Period</Text>
            <Text style={styles.periodText}>
              {dateFrom.split("T")[0]} — {dateTo.split("T")[0]}
            </Text>
          </View>
        </View>

        {/* Section Header: Financial Overview */}
        <Text style={styles.sectionHeader}>Financial Overview & Metrics</Text>

        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Inventory Value</Text>
            <Text style={styles.kpiValue}>{formatPrice(totalValue)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Spend</Text>
            <Text style={styles.kpiValue}>{formatPrice(totalSpend)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Stock Wastage</Text>
            <Text style={styles.kpiValue}>{formatPrice(totalWastage)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Consumed</Text>
            <Text style={styles.kpiValue}>{formatPrice(totalConsume)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Sales</Text>
            <Text style={styles.kpiValue}>{formatPrice(totalSale)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Laundry Out Stock</Text>
            <Text style={styles.kpiValue}>{totalLaundryOut.toString()}</Text>
          </View>
        </View>

        {/* Low Stock Alerts Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderTitleContainer}>
            <Text style={styles.tableHeaderTitle}>Low Stock Alerts</Text>
            <Text style={styles.tableHeaderBadge}>
              Total Items: {summary?.totalLowStockCount ?? lowStocks.length}
            </Text>
          </View>

          <View style={styles.headerRow}>
            <Text style={[styles.colHeaderCell, styles.colLowName]}>
              Item Name
            </Text>
            <Text style={[styles.colHeaderCell, styles.colLowCurrent]}>
              Current
            </Text>
            <Text style={[styles.colHeaderCell, styles.colLowMin]}>
              Min Threshold
            </Text>
            <Text style={[styles.colHeaderCell, styles.colLowStatus]}>
              Status
            </Text>
          </View>

          {lowStocks.length === 0 ? (
            <Text style={styles.emptyState}>No low stock items found.</Text>
          ) : (
            lowStocks.map((item, i) => {
              const isCritical = item.currentStock <= item.minThreshold / 2;
              return (
                <View
                  style={[
                    styles.row,
                    i % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  ]}
                  key={item.id || i}
                >
                  <Text style={[styles.cellBoldText, styles.colLowName]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cellMutedText, styles.colLowCurrent]}>
                    {item.currentStock}
                  </Text>
                  <Text style={[styles.cellMutedText, styles.colLowMin]}>
                    {item.minThreshold}
                  </Text>
                  <View style={styles.colLowStatus}>
                    <Text
                      style={
                        isCritical
                          ? styles.criticalStatusPill
                          : styles.lowStatusPill
                      }
                    >
                      {isCritical ? "CRITICAL" : "LOW"}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Flagged Expired Stock Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderTitleContainer}>
            <Text style={styles.tableHeaderTitle}>Flagged Expired Stock</Text>
            <Text style={styles.tableHeaderBadge}>
              Total Expired:{" "}
              {summary?.flaggedExpiredStocks?.totalExpiredCount ??
                flaggedExpiredStocks.length}
            </Text>
          </View>

          <View style={styles.headerRow}>
            <Text style={[styles.colHeaderCell, styles.colExpName]}>
              Item Name
            </Text>
            <Text style={[styles.colHeaderCell, styles.colExpLocation]}>
              Location
            </Text>
            <Text style={[styles.colHeaderCell, styles.colExpQty]}>Qty</Text>
            <Text style={[styles.colHeaderCell, styles.colExpDate]}>
              Expired Date
            </Text>
          </View>

          {flaggedExpiredStocks.length === 0 ? (
            <Text style={styles.emptyState}>
              No flagged expired stocks found.
            </Text>
          ) : (
            flaggedExpiredStocks.map((item, i) => {
              const formattedDate = item.expiredAt
                ? typeof item.expiredAt === "string"
                  ? item.expiredAt
                  : new Date(item.expiredAt).toISOString().slice(0, 10)
                : "N/A";

              return (
                <View
                  style={[
                    styles.row,
                    i % 2 === 0 ? styles.rowEven : styles.rowOdd,
                  ]}
                  key={item.id || i}
                >
                  <Text style={[styles.cellBoldText, styles.colExpName]}>
                    {item.item.name}
                  </Text>
                  <Text style={[styles.cellMutedText, styles.colExpLocation]}>
                    {item.location?.name ?? ""}
                  </Text>
                  <Text style={[styles.cellMutedText, styles.colExpQty]}>
                    {item.quantity}
                  </Text>
                  <Text style={[styles.cellMutedText, styles.colExpDate]}>
                    {formattedDate}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Dynamic Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Internal Management System — Executive Operations & Audit Report
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
            fixed
          />
        </View>
      </Page>
    </Document>
  );
}

export async function renderReportPdf(props: {
  data: GetFinancialSummaryServiceResult;
  dateFrom: string;
  dateTo: string;
}): Promise<Buffer> {
  return renderToBuffer(<ReportDocument {...props} />);
}
