/**
 * Dashboard Summary Model
 */
export interface DashboardSummary {
  totalImmovableAssets: number;
  totalMovableAssets: number;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  familyMembersCount: number;
  topAssets: AssetSummary[];
  biggestLiability: LiabilitySummary | null;
  assetDistribution: CategoryDistribution[];
  liabilityDistribution: CategoryDistribution[];
}

export interface AssetSummary {
  name: string;
  value: number;
  type: string;
}

export interface LiabilitySummary {
  name: string;
  outstandingAmount: number;
  type: string;
}

export interface CategoryDistribution {
  category: string;
  value: number;
  percentage: number;
}
