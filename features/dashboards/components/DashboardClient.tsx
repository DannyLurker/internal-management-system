"use client";
import { dashboardStyles } from "../dashboard.styles";
import DashboardHeader from "./DashboardHeader";
import KPICard from "./KPICard";
import LowStockTable from "./LowStockTable";
import FlaggedExpiredTable from "./FlaggedExpiredTable";
import {
  Wallet,
  TrendingDown,
  PackageMinus,
  ClipboardCheck,
  ShoppingBag,
  Shirt,
} from "lucide-react";
import { useManagerDashboard } from "../dashboard.hooks";
import { formatPrice } from "@/shared/lib/formatter";

import { useSession } from "next-auth/react";

export default function DashboardClient() {
  const { data: session } = useSession();

  const { data } = useManagerDashboard({
    lowStockAlertPage: 1,
    lowStockAlertDataPerPage: 10,
    flaggedExpiredStockPage: 1,
    flaggedExpiredStockDataPerPage: 10,
  });

  const totalValue = data?.data?.totalInventoryValue ?? 0;
  const totalSpend = data?.data?.totalSpend ?? 0;
  const totalWastage = data?.data?.totalStockWastageValue ?? 0;
  const totalConsume = data?.data?.totalConsume ?? 0;
  const totalSale = data?.data?.totalSale ?? 0;
  const totalLaundryOut = data?.data?.totalLaundryOut ?? 0;

  return (
    <div className={dashboardStyles.pageContainer}>
      <DashboardHeader />

      {session?.user.role === "HOTEL_MANAGER" && (
        <div>
          <div className={dashboardStyles.kpiGrid}>
            <KPICard
              label="Total Inventory Value"
              value={formatPrice(totalValue)}
              description="Monetary value of unexpired, ready-to-use stock"
              icon={<Wallet className="w-5 h-5" />}
            />
            <KPICard
              label="Total Spend"
              value={formatPrice(totalSpend)}
              description="Total procurement expenses from received stock shipments"
              icon={<TrendingDown className="w-5 h-5" />}
            />
            <KPICard
              label="Total Stock Wastage"
              value={formatPrice(totalWastage)}
              description="Combined loss from expired, lost, or damaged items"
              icon={<PackageMinus className="w-5 h-5" />}
            />
            <KPICard
              label="Total Consumed"
              value={formatPrice(totalConsume)}
              description="Items consumed for internal operations and housekeeping"
              icon={<ClipboardCheck className="w-5 h-5" />}
            />
            <KPICard
              label="Total Sales"
              value={formatPrice(totalSale)}
              description="Cost of goods sold (COGS) for direct customer sales"
              icon={<ShoppingBag className="w-5 h-5" />}
            />
            <KPICard
              label="Total Laundry Out"
              value={formatPrice(totalLaundryOut)}
              description="Linens and fabrics sent out to laundry facilities"
              icon={<Shirt className="w-5 h-5" />}
            />
          </div>

          <div className="flex flex-col gap-6">
            <LowStockTable />
            <FlaggedExpiredTable />
          </div>
        </div>
      )}
    </div>
  );
}
