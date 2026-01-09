/**
 * Family Member Model
 */
export type RelationshipType =
  | 'Father'
  | 'Mother'
  | 'Spouse'
  | 'Son'
  | 'Daughter'
  | 'Brother'
  | 'Sister'
  | 'Grandfather'
  | 'Grandmother'
  | 'Uncle'
  | 'Aunt'
  | 'Cousin'
  | 'Other';

export type DependencyStatus = 'Dependent' | 'Independent';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: RelationshipType;
  email: string;
  phone: string;
  dateOfBirth?: string;
  dependencyStatus: DependencyStatus;
  notes: string;
  parentId?: string; // For hierarchy
  createdAt: string;
  updatedAt: string;
}

export const RELATIONSHIP_OPTIONS: RelationshipType[] = [
  'Father',
  'Mother',
  'Spouse',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Grandfather',
  'Grandmother',
  'Uncle',
  'Aunt',
  'Cousin',
  'Other'
];

export const DEFAULT_FAMILY_MEMBER: FamilyMember = {
  id: '',
  name: '',
  relationship: 'Other',
  email: '',
  phone: '',
  dateOfBirth: '',
  dependencyStatus: 'Independent',
  notes: '',
  parentId: undefined,
  createdAt: '',
  updatedAt: ''
};
