export enum LicenseStatus {
  ACTIVE = 'Ativo',
  WARNING = 'A Vencer',
  EXPIRED = 'Vencido',
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  city: string;
  contactName: string;
  email: string;
  phone: string;
}

export interface License {
  id: string;
  companyId: string;
  number: string;
  issueDate: string; // ISO Date string
  expirationDate: string; // ISO Date string
  authority: string; // e.g., VISA Municipal, ANVISA
  notes?: string;
}

export interface DashboardStats {
  totalCompanies: number;
  totalLicenses: number;
  expiredLicenses: number;
  warningLicenses: number;
  activeLicenses: number;
}

export type View = 'dashboard' | 'companies' | 'licenses' | 'reports' | 'advisor' | 'settings';

export type ThemeMode = 'light' | 'dark';
export type PrimaryColor = 'teal' | 'blue' | 'indigo' | 'violet' | 'rose' | 'amber';

export interface ThemePreferences {
  mode: ThemeMode;
  primaryColor: PrimaryColor;
}