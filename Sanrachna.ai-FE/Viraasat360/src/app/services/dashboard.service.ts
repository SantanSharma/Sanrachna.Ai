import { Injectable, inject, computed } from '@angular/core';
import { DashboardSummary } from '../models';
import { AssetService } from './asset.service';
import { LiabilityService } from './liability.service';
import { FamilyService } from './family.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private assetService = inject(AssetService);
  private liabilityService = inject(LiabilityService);
  private familyService = inject(FamilyService);

  readonly totalImmovableAssets = this.assetService.totalImmovableValue;
  readonly totalMovableAssets = this.assetService.totalMovableValue;
  readonly totalAssets = this.assetService.totalValue;
  readonly totalLiabilities = this.liabilityService.totalOutstanding;
  readonly familyCount = this.familyService.count;

  readonly netWorth = computed(() =>
    this.totalAssets() - this.totalLiabilities()
  );

  readonly summary = computed<DashboardSummary>(() => {
    const topAssets = this.assetService.getTopAssets(3).map(a => ({
      name: a.name,
      value: a.value,
      type: 'assetType' in a ? a.assetType : 'Unknown'
    }));

    const biggestLiability = this.liabilityService.getBiggest();

    return {
      totalImmovableAssets: this.totalImmovableAssets(),
      totalMovableAssets: this.totalMovableAssets(),
      totalAssets: this.totalAssets(),
      totalLiabilities: this.totalLiabilities(),
      netWorth: this.netWorth(),
      familyMembersCount: this.familyCount(),
      topAssets,
      biggestLiability: biggestLiability ? {
        name: biggestLiability.name,
        outstandingAmount: biggestLiability.outstandingAmount,
        type: biggestLiability.type
      } : null,
      assetDistribution: this.assetService.getDistribution(),
      liabilityDistribution: this.liabilityService.getDistribution()
    };
  });

  getSummary(): DashboardSummary {
    return this.summary();
  }
}
