"use client";

export default function TableHeader() {
  return (
    <thead>
      <tr className="border-b border-[#d9e3f4] text-left">
        <th className="pb-3 pe-4 ps-4 pt-3 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          Name
        </th>
        <th className="pb-3 px-4 pe-4 pt-3 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          Type
        </th>
        <th className="hidden px-4 pb-3 pe-4 pt-3 font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80 md:table-cell">
          Description
        </th>
        <th className="w-32 pb-3 pe-4 pt-3 text-end font-ochre-ui text-[10px] font-semibold uppercase tracking-wider text-[#524439]/80">
          Actions
        </th>
      </tr>
    </thead>
  );
}
