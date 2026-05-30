import { Suspense } from "react";
import LocationManagement from "@/features/locations/components/LocationManagement";

export default function LocationsPage() {
  return (
    <Suspense fallback={null}>
      <LocationManagement />
    </Suspense>
  );
}
