export const buildDateRangeFilter = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) {
    return {};
  }

  return {
    createdAt: {
      ...(startDate ? { gte: new Date(startDate) } : {}),
      ...(endDate ? { lt: new Date(endDate) } : {}),
    },
  };
};
