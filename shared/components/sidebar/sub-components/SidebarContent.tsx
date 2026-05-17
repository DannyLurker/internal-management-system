import { cn } from "@/shared/lib/utils";
import SectionLabel from "./SecitionLabel";
import SidebarDashboardLink from "./SidebarDashboardLink";
import { LayoutGrid } from "lucide-react";
import SidebarInventory from "./SidebarInventory";
import { paths } from "@/shared/lib/constants/url-paths";

export default function SidebarNavContent({
  isExpanded,
  pathname,
  inventoryOpen,
  setInventoryOpen,
  inventoryFlyoutOpen,
  openInventoryFlyout,
  scheduleCloseInventoryFlyout,
  onInventoryKeyDown,
  inventoryFlyoutId,
}: {
  isExpanded: boolean;
  pathname: string;
  inventoryOpen: boolean;
  setInventoryOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inventoryFlyoutOpen: boolean;
  openInventoryFlyout: () => void;
  scheduleCloseInventoryFlyout: () => void;
  onInventoryKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
  inventoryFlyoutId: string;
}) {
  return (
    <nav className="flex min-h-0 flex-1 flex-col overflow-visible px-2 pb-4 pt-2">
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-col overflow-y-auto overflow-x-hidden",
          isExpanded && "flex-1",
        )}
      >
        {isExpanded && <SectionLabel>Management</SectionLabel>}

        <SidebarDashboardLink
          href={paths.dashboard}
          label="Dashboard"
          icon={LayoutGrid}
          isActive={pathname === paths.dashboard}
          isExpanded={isExpanded}
        />

        {isExpanded && (
          <SidebarInventory
            isExpanded={isExpanded}
            onMouseEnter={openInventoryFlyout}
            onMouseLeave={scheduleCloseInventoryFlyout}
            onKeyDown={onInventoryKeyDown}
            inventoryFlyoutId={inventoryFlyoutId}
            inventoryFlyoutOpen={inventoryFlyoutOpen}
            pathname={pathname}
            paths={paths}
            inventoryOpen={inventoryOpen}
            setInventoryOpen={setInventoryOpen}
          />
        )}
      </div>

      {!isExpanded && (
        <SidebarInventory
          isExpanded={isExpanded}
          onMouseEnter={openInventoryFlyout}
          onMouseLeave={scheduleCloseInventoryFlyout}
          onKeyDown={onInventoryKeyDown}
          inventoryFlyoutId={inventoryFlyoutId}
          inventoryFlyoutOpen={inventoryFlyoutOpen}
          pathname={pathname}
          paths={paths}
          inventoryOpen={inventoryOpen}
          setInventoryOpen={setInventoryOpen}
        />
      )}
    </nav>
  );
}
