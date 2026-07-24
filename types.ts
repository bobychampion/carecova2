
export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  COMPLETED = 'COMPLETED'
}

export interface LoanApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  hospitalId: string;
  treatmentType: string;
  estimatedCost: number;
  repaymentDuration: number; // in months
  status: LoanStatus;
  appliedAt: string;
  repaymentSchedule?: RepaymentInstallment[];

  financing_status?: string;
  reserved_by_financier_id?: string | null;
  reserved_by_user_id?: string | null;
  reserved_at?: string | null;
  financed_at?: string | null;
  financing_amount?: number | null;
  financier_notes?: string | null;
  financed_by?: string | null;
  financed_by_user_id?: string | null;
  lastReviewedByFinancier?: string | null;
  lastReviewStartedAt?: string | null;
}

export interface RepaymentInstallment {
  dueDate: string;
  amount: number;
  status: 'UNPAID' | 'PAID';
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  specialty: string;
  image: string;
}
