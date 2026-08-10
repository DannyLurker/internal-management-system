export const buildDateRangeFilter = (startDate?: string, endDate?: string) => {
  if (!startDate && !endDate) return {};

  let lowerBound: Date | undefined;
  let upperBound: Date | undefined;

  if (startDate) {
    // Set to 00:00:00 local time
    lowerBound = new Date(`${startDate}T00:00:00`);
  }

  if (endDate) {
    // Set to start of the NEXT day local time
    const nextDay = new Date(`${endDate}T00:00:00`);
    nextDay.setDate(nextDay.getDate() + 1);
    upperBound = nextDay;
  }

  return {
    createdAt: {
      ...(lowerBound ? { gte: lowerBound } : {}),
      ...(upperBound ? { lt: upperBound } : {}),
    },
  };
};
