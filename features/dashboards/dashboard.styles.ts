export const dashboardStyles = {
  pageContainer: "min-h-0 flex-1 bg-[#f8f9ff] px-4 py-8 md:px-10",

  headerContainer: "mb-8",

  headerContent:
    "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between",

  headerText: "w-full",

  headerTitle:
    "font-ochre-brand text-3xl font-medium text-[#894d0d] md:text-4xl",

  headerDescription:
    "mt-2 w-2/3 font-ochre-brand text-sm italic leading-relaxed text-[#524439] md:w-auto md:text-base",

  headerActions:
    "flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center",

  exportButton:
    "h-9 w-full gap-2 rounded-lg border-[#d9e3f4] bg-white px-3 font-ochre-ui text-sm font-semibold text-[#524439] shadow-sm transition-colors hover:border-[#894d0d]/50 hover:bg-[#894d0d]/5 hover:text-[#894d0d] sm:w-auto",

  kpiGrid: "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",
  // Replace kpiCard, kpiLabelContainer, and kpiDetail with these styles:
  kpiCard:
    "flex flex-col justify-between overflow-hidden rounded-xl border border-[#d9e3f4]/80 bg-white shadow-[0_16px_48px_-20px_rgba(15,23,42,0.08)] hover:-translate-y-px hover:shadow-[0_24px_56px_-24px_rgba(15,23,42,0.12)] transition-all p-5",

  kpiLabelContainer: "flex justify-between items-center mb-2",

  kpiLabel:
    "font-ochre-ui uppercase tracking-wide text-xs font-semibold text-[#524439]/80",

  kpiValue:
    "font-ochre-brand text-2xl lg:text-3xl font-semibold text-[#121c28] my-1",

  kpiDetail:
    "font-ochre-ui text-xs text-[#524439]/70 mt-2 border-t border-[#f0f4f9] pt-2 line-clamp-2",
  tableCard:
    "overflow-hidden rounded-xl border border-[#d9e3f4]/80 bg-white shadow-[0_16px_48px_-20px_rgba(15,23,42,0.08)] mb-8",
  tableHeader:
    "px-6 py-5 border-b border-[#eef4ff] flex justify-between items-center bg-[#f8f9ff]/40",
  tableTitle: "font-ochre-brand text-2xl font-medium text-[#121c28]",

  statusPill:
    "px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase font-ochre-ui inline-block",
  criticalStatus: "bg-[#ffdad6] text-[#ba1a1a]",
  lowStatus: "bg-[#ffb77b]/30 text-[#894d0d]",
  reviewStatus: "bg-[#dae2fd] text-[#565e74]",

  actionText:
    "text-[#894d0d] font-semibold text-xs tracking-wide uppercase hover:underline font-ochre-ui",

  // Pagination styles
  paginationContainer:
    "flex flex-col gap-3 border-t border-[#eef4ff] px-4 py-3 font-ochre-ui text-sm text-[#524439] sm:flex-row sm:items-center sm:justify-between bg-white",
  paginationButton:
    "rounded-md border border-[#d9e3f4] p-1.5 text-[#565e74] hover:border-[#894d0d]/40 hover:text-[#894d0d] disabled:cursor-not-allowed disabled:opacity-40",
  paginationTextButton:
    "rounded-md border border-[#d9e3f4] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#565e74] hover:border-[#894d0d]/40 hover:text-[#894d0d] disabled:cursor-not-allowed disabled:opacity-40 bg-white",
  paginationActiveIndicator:
    "rounded-md bg-[#894d0d] px-3 py-1.5 text-xs font-semibold text-white",

  // ── Date Filter Dropdown ─────────────────────────────────────────────────
  dateFilterContainer: "flex items-center gap-3",
  dateFilterLabel:
    "font-ochre-ui text-xs font-semibold uppercase tracking-widest text-[#524439]/80 hidden sm:block",
  dateFilterTrigger:
    "flex items-center gap-2 rounded-lg border border-[#d9e3f4] bg-white px-3 py-1.5 font-ochre-ui text-sm text-[#524439] shadow-sm hover:border-[#894d0d]/50 hover:text-[#894d0d] transition-colors cursor-pointer min-w-[11rem]",
  dateFilterActiveBadge:
    "ml-auto rounded-sm bg-[#894d0d]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#894d0d]",
};
