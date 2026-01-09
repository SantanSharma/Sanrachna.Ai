/**
 * Liability Model
 */

export type LiabilityType =
  | 'Home Loan'
  | 'Personal Loan'
  | 'Car Loan'
  | 'Education Loan'
  | 'Credit Card'
  | 'Mortgage'
  | 'Business Loan'
  | 'Gold Loan'
  | 'Other';

export type LiabilityStatus = 'Active' | 'Closed' | 'Defaulted';

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  lenderName: string;
  principalAmount: number;
  outstandingAmount: number;
  emi: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  status: LiabilityStatus;
  linkedAssetId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const LIABILITY_TYPES: LiabilityType[] = [
  'Home Loan',
  'Personal Loan',
  'Car Loan',
  'Education Loan',
  'Credit Card',
  'Mortgage',
  'Business Loan',
  'Gold Loan',
  'Other'
];

export const DEFAULT_LIABILITY: Liability = {
  id: '',
  name: '',
  type: 'Personal Loan',
  lenderName: '',
  principalAmount: 0,
  outstandingAmount: 0,
  emi: 0,
  interestRate: 0,
  startDate: '',
  endDate: '',
  status: 'Active',
  notes: '',
  createdAt: '',
  updatedAt: ''
};
