/**
 * User Profile Model
 */
export interface UserProfile {
  id: string;
  fullName: string;
  dateOfBirth: string;
  occupation: string;
  monthlySalary: number;
  annualSalary: number;
  email: string;
  phone: string;
  address: string;
  pan?: string;
  nomineePreference?: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: '',
  fullName: '',
  dateOfBirth: '',
  occupation: '',
  monthlySalary: 0,
  annualSalary: 0,
  email: '',
  phone: '',
  address: '',
  pan: '',
  nomineePreference: '',
  createdAt: '',
  updatedAt: ''
};
