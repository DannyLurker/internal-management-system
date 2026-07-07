export interface LocationDeletionCheckInput {
  stocks: { id: string }[];
}

export interface RuleResult {
  allowed: boolean;
  reason?: string;
}

const locationRules = {
  canDeleteLocation(location: LocationDeletionCheckInput): RuleResult {
    if (location.stocks.length > 0) {
      return {
        allowed: false,
        reason:
          "Item was found in this location. Migrate all the item before deleting.",
      };
    }

    return { allowed: true };
  },
};

export default locationRules;
