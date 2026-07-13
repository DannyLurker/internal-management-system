// CURRENTLY DOESN'T HAVE ANY FUNCTIONALITY
export function formatItemSku(id: string) {
  const suffix = id.replace(/\W/g, "").slice(-4).toUpperCase().padStart(4, "0");
  return `HOS-${suffix}`;
}

export function formatItemPrice(
  value: number | string | null | undefined | { toString(): string },
) {
  const num = value == null ? 0 : Number(String(value));
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(num);
}

export function formatItemDate(value: Date | string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

// change "1000000" into "10.000.000"
export const formatThousand = (value: string | number): string => {
  if (!value) return "";
  const numString = value.toString().replace(/\D/g, ""); // Hapus semua karakter non-angka
  return new Intl.NumberFormat("id-ID").format(Number(numString));
};

// change "10.000.000" into 10000000 for database
export const unformatThousand = (value: string): number => {
  if (!value) return 0;
  return Number(value.replace(/\./g, "")); // Hapus semua titik
};
