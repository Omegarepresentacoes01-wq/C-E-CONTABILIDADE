import { Company, License, ThemePreferences } from '../types';

const STORAGE_KEYS = {
  COMPANIES: 'sanicontrol_companies',
  LICENSES: 'sanicontrol_licenses',
  THEME: 'sanicontrol_theme',
};

// Mock Initial Data
const INITIAL_COMPANIES: Company[] = [
  {
    id: '1',
    name: 'Padaria Sabor do Trigo Ltda',
    cnpj: '12.345.678/0001-90',
    city: 'São Paulo',
    contactName: 'João Silva',
    email: 'joao@sabordotrigo.com.br',
    phone: '(11) 99999-9999',
  },
  {
    id: '2',
    name: 'Restaurante Bom Paladar',
    cnpj: '98.765.432/0001-10',
    city: 'Campinas',
    contactName: 'Maria Oliveira',
    email: 'maria@bompaladar.com',
    phone: '(19) 88888-8888',
  },
  {
    id: '3',
    name: 'Farmácia Saúde Total',
    cnpj: '45.678.901/0001-23',
    city: 'Santos',
    contactName: 'Carlos Santos',
    email: 'contato@saudetotal.com.br',
    phone: '(13) 77777-7777',
  },
];

const INITIAL_LICENSES: License[] = [
  {
    id: '101',
    companyId: '1',
    number: 'VISA-SP-2023-001',
    issueDate: '2023-01-15',
    expirationDate: '2024-01-15', // Expired
    authority: 'Vigilância Sanitária Municipal',
    notes: 'Renovação pendente de vistoria.',
  },
  {
    id: '102',
    companyId: '2',
    number: 'VISA-CP-2023-882',
    issueDate: '2023-06-20',
    expirationDate: '2024-06-20', // Upcoming/Warning (depending on current date) or Expired
    authority: 'Vigilância Sanitária Municipal',
  },
  {
    id: '103',
    companyId: '3',
    number: 'ANVISA-AFE-2024',
    issueDate: '2024-02-10',
    expirationDate: '2025-02-10', // Active
    authority: 'ANVISA',
    notes: 'Autorização de Funcionamento',
  },
  {
    id: '104',
    companyId: '1',
    number: 'CMVS-2024-XP',
    issueDate: '2024-03-01',
    expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Warning (15 days from now)
    authority: 'Prefeitura de SP',
  }
];

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