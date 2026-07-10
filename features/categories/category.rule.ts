import { RuleResult } from "@/shared/lib/types/rule.type";

type categoryDeleteCheckInput = {
  items: {
    id: string;
  }[];
};

const categoryRules = {
  canDeleteCategory: (category: categoryDeleteCheckInput): RuleResult => {
    if (category.items.length > 0) {
      return {
        allowed: false,
        reason:
          "Item was found in this category. Migrate all the items before deleting.",
      };
    }

    return {
      allowed: true,
    };
  },
};

export default categoryRules;
