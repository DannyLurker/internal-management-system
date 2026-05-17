import { cn } from "@/shared/lib/utils";

export default function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className={cn(
        "px-3 pb-2 pt-6 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider",
        "text-[#eaf1ff]/45 first:pt-0",
      )}
    >
      {children}
    </p>
  );
}
