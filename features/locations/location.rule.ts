import { RuleResult } from "@/shared/lib/types/rule.type";

export interface LocationDeletionCheckInput {
  stocks: { id: string }[];
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
