// Core types for Cerebrum

export interface PatientData {
  address: string;
  healthScore: bigint;
  isRegistered: boolean;
  sharingEnabled: boolean;
  totalEarnings: string;
  lastUpdated: number;
}

export interface HealthMetrics {
  bloodSugar: number;
  cholesterol: number;
  bmi: number;
}

export interface LenderData {
  address: string;
  name: string;
  isApproved: boolean;
}

export interface QualificationResult {
  qualified: boolean;
  riskLevel: number; // 1=Low, 2=Medium, 3=High
  timestamp: number;
}

export interface ResearcherData {
  address: string;
  organization: string;
  hasAccess: boolean;
}

export interface AggregateStats {
  totalPatients: number;
  totalDataShares: number;
  averageBloodSugar: number;
  averageCholesterol: number;
}

export interface Transaction {
  hash: string;
  type: 'register' | 'share' | 'approve' | 'claim';
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}

export type UserRole = 'patient' | 'lender' | 'researcher' | null;
