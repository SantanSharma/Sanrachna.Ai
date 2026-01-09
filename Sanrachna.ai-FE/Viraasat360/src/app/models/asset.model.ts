/**
 * Asset Models
 */

// Asset Categories
export type AssetCategory = 'immovable' | 'movable';

// Immovable Asset Types
export type ImmovableAssetType = 'Land' | 'House' | 'Flat' | 'Commercial Property' | 'Agricultural Land' | 'Other';

// Movable Asset Types
export type MovableAssetType =
  | 'Bank Account'
  | 'Fixed Deposit'
  | 'Stocks'
  | 'Mutual Funds'
  | 'Gold'
  | 'Cash'
  | 'PPF'
  | 'EPF'
  | 'Insurance'
  | 'Bonds'
  | 'Cryptocurrency'
  | 'Vehicle'
  | 'Other';

// Ownership Types
export type OwnershipType = 'Self' | 'Joint' | 'Ancestral' | 'Inherited' | 'Gifted';

// Bank Account Types
export type BankAccountType = 'Savings' | 'Current' | 'Salary' | 'NRI' | 'Other';

/**
 * Base Asset Interface
 */
export interface BaseAsset {
  id: string;
  name: string;
  category: AssetCategory;
  value: number;
  ownershipType: OwnershipType;
  sharePercentage: number;
  linkedFamilyMemberId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Immovable Asset
 */
export interface ImmovableAsset extends BaseAsset {
  category: 'immovable';
  assetType: ImmovableAssetType;
  location: string;
  registrationNumber?: string;
  purchaseDate?: string;
  purchaseValue?: number;
}

/**
 * Movable Asset
 */
export interface MovableAsset extends BaseAsset {
  category: 'movable';
  assetType: MovableAssetType;

  // Bank Account specific
  bankName?: string;
  accountType?: BankAccountType;
  accountNumber?: string;

  // FD/Investment specific
  maturityDate?: string;
  interestRate?: number;
  investedAmount?: number;
  currentValue?: number;

  // Platform specific (for stocks/MF)
  platform?: string;
}

export type Asset = ImmovableAsset | MovableAsset;

export const IMMOVABLE_ASSET_TYPES: ImmovableAssetType[] = [
  'Land',
  'House',
  'Flat',
  'Commercial Property',
  'Agricultural Land',
  'Other'
];

export const MOVABLE_ASSET_TYPES: MovableAssetType[] = [
  'Bank Account',
  'Fixed Deposit',
  'Stocks',
  'Mutual Funds',
  'Gold',
  'Cash',
  'PPF',
  'EPF',
  'Insurance',
  'Bonds',
  'Cryptocurrency',
  'Vehicle',
  'Other'
];

export const OWNERSHIP_TYPES: OwnershipType[] = [
  'Self',
  'Joint',
  'Ancestral',
  'Inherited',
  'Gifted'
];

export const BANK_ACCOUNT_TYPES: BankAccountType[] = [
  'Savings',
  'Current',
  'Salary',
  'NRI',
  'Other'
];

export const DEFAULT_IMMOVABLE_ASSET: ImmovableAsset = {
  id: '',
  name: '',
  category: 'immovable',
  assetType: 'House',
  value: 0,
  ownershipType: 'Self',
  sharePercentage: 100,
  location: '',
  notes: '',
  createdAt: '',
  updatedAt: ''
};

export const DEFAULT_MOVABLE_ASSET: MovableAsset = {
  id: '',
  name: '',
  category: 'movable',
  assetType: 'Bank Account',
  value: 0,
  ownershipType: 'Self',
  sharePercentage: 100,
  notes: '',
  createdAt: '',
  updatedAt: ''
};
