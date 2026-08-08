import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10 },
  header: { fontSize: 16, marginBottom: 12, fontWeight: "bold" },
  subHeader: { fontSize: 11, marginBottom: 16, color: "#555" },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 6,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 6,
    fontWeight: "bold",
  },
  cell: { flex: 1 },
});

// Sync tipe data sesuai include pada Prisma StockMovement
export type ReportRow = {
  item: { name: string };
  sourceLocation?: { name: string } | null;
  destinationLocation?: { name: string } | null;
  quantity: number;
  type: string;
  createdAt: Date | string;
};

function ReportDocument({
  rows,
  reportType,
  dateFrom,
  dateTo,
}: {
  rows: ReportRow[];
  reportType: string;
  dateFrom: string;
  dateTo: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{reportType} Report</Text>
        <Text style={styles.subHeader}>
          Period: {dateFrom} — {dateTo}
        </Text>

        {/* Table Header */}
        <View style={styles.headerRow}>
          <Text style={styles.cell}>Item Name</Text>
          <Text style={styles.cell}>Movement</Text>
          <Text style={styles.cell}>Qty</Text>
          <Text style={styles.cell}>Date</Text>
        </View>

        {/* Table Rows */}
        {rows.map((r, i) => {
          // Menentukan string lokasi asal -> tujuan
          const src = r.sourceLocation?.name || "N/A";
          const dest = r.destinationLocation?.name || "N/A";
          const locationInfo = `${src} ➔ ${dest}`;

          const formattedDate =
            typeof r.createdAt === "string"
              ? r.createdAt.slice(0, 10)
              : new Date(r.createdAt).toISOString().slice(0, 10);

          return (
            <View style={styles.row} key={i}>
              <Text style={styles.cell}>{r.item.name}</Text>
              <Text style={styles.cell}>{locationInfo}</Text>
              <Text style={styles.cell}>{r.quantity}</Text>
              <Text style={styles.cell}>{formattedDate}</Text>
            </View>
          );
        })}
      </Page>
    </Document>
  );
}

export async function renderReportPdf(props: {
  reportType: string;
  rows: ReportRow[];
  dateFrom: string;
  dateTo: string;
}): Promise<Buffer> {
  return renderToBuffer(<ReportDocument {...props} />);
}
