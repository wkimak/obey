export type GlobalRule = {
  id: string;
  title: string;
  description?: string | null;
  key?: string | null;
};

export type StrategyRuleWithRule = {
  id: string;
  strategyId: string;
  ruleId: string;
  section?: string | null;
  displayText: string;
  displayOrder: number;
  rule: {
    id: string;
    title: string;
    description?: string | null;
    key?: string | null;
  };
};

export type Strategy = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  archived: boolean;
  strategyRules: StrategyRuleWithRule[];
};

export type StrategyListItem = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  archived: boolean;
  ruleCount: number;
};

export type CreateStrategyRuleExisting = {
  ruleId: string;
  section: string | null;
  displayText: string;
  displayOrder: number;
};

export type CreateStrategyRuleNew = {
  title: string;
  key?: string | null;
  description?: string | null;
  section: string | null;
  displayText: string;
  displayOrder: number;
};

export type CreateStrategyBody = {
  name: string;
  description?: string | null;
  rules: Array<CreateStrategyRuleExisting | CreateStrategyRuleNew>;
};

