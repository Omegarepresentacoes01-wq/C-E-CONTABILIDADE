import { Company, License, ThemePreferences } from '../types';

const STORAGE_KEYS = {
  COMPANIES: 'sanicontrol_companies',
  LICENSES: 'sanicontrol_licenses',
  THEME: 'sanicontrol_theme',
};

// Dados Iniciais Vazios para Produção (Uso Real)
const INITIAL_COMPANIES: Company[] = [];
const INITIAL_LICENSES: License[] = [];

export const getCompanies = (): Company[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COMPANIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(INITIAL_COMPANIES));
    return INITIAL_COMPANIES;
  }
  return JSON.parse(data);
};

export const saveCompany = (company: Company): void => {
  const companies = getCompanies();
  const index = companies.findIndex((c) => c.id === company.id);
  if (index >= 0) {
    companies[index] = company;
  } else {
    companies.push(company);
  }
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
};

export const deleteCompany = (id: string): void => {
  const companies = getCompanies().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  
  // Cleanup licenses
  const licenses = getLicenses().filter((l) => l.companyId !== id);
  localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));
};

export const getLicenses = (): License[] => {
  const data = localStorage.getItem(STORAGE_KEYS.LICENSES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(INITIAL_LICENSES));
    return INITIAL_LICENSES;
  }
  return JSON.parse(data);
};

export const saveLicense = (license: License): void => {
  const licenses = getLicenses();
  const index = licenses.findIndex((l) => l.id === license.id);
  if (index >= 0) {
    licenses[index] = license;
  } else {
    licenses.push(license);
  }
  localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));
};

export const deleteLicense = (id: string): void => {
  const licenses = getLicenses().filter((l) => l.id !== id);
  localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(licenses));
};

// System Management
export const clearSystemData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.COMPANIES);
  localStorage.removeItem(STORAGE_KEYS.LICENSES);
  // Mantemos o tema para não quebrar a UX
};

// Backup System
export const createBackup = (): string => {
  const backupData = {
    companies: getCompanies(),
    licenses: getLicenses(),
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  return JSON.stringify(backupData, null, 2);
};

export const restoreBackup = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    
    // Basic validation
    if (!Array.isArray(data.companies) || !Array.isArray(data.licenses)) {
      throw new Error("Formato de arquivo inválido");
    }

    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(data.companies));
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify(data.licenses));
    return true;
  } catch (error) {
    console.error("Erro ao restaurar backup:", error);
    return false;
  }
};

// Theme Settings
export const getThemePreferences = (): ThemePreferences => {
  const data = localStorage.getItem(STORAGE_KEYS.THEME);
  if (!data) {
    return { mode: 'light', primaryColor: 'teal' };
  }
  return JSON.parse(data);
};

export const saveThemePreferences = (prefs: ThemePreferences): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(prefs));
};