import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CompanyManager from './components/CompanyManager';
import LicenseManager from './components/LicenseManager';
import Settings from './components/Settings';
import Reports from './components/Reports';
import { View, Company, License } from './types';
import * as storage from './services/storageService';
import { ThemeProvider } from './contexts/ThemeContext';

function AppContent() {
  const [view, setView] = useState<View>('dashboard');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);

  // Load initial data
  useEffect(() => {
    setCompanies(storage.getCompanies());
    setLicenses(storage.getLicenses());
  }, []);

  const refreshData = () => {
    setCompanies(storage.getCompanies());
    setLicenses(storage.getLicenses());
  };

  // Company Actions
  const handleAddCompany = (c: Company) => {
    storage.saveCompany(c);
    refreshData();
  };
  const handleEditCompany = (c: Company) => {
    storage.saveCompany(c);
    refreshData();
  };
  const handleDeleteCompany = (id: string) => {
    storage.deleteCompany(id);
    refreshData();
  };

  // License Actions
  const handleAddLicense = (l: License) => {
    storage.saveLicense(l);
    refreshData();
  };
  const handleEditLicense = (l: License) => {
    storage.saveLicense(l);
    refreshData();
  };
  const handleDeleteLicense = (id: string) => {
    storage.deleteLicense(id);
    refreshData();
  };

  // Notification Logic
  const notificationCounts = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const warningThreshold = new Date();
    warningThreshold.setDate(today.getDate() + 30); // 30 days warning
    warningThreshold.setHours(0,0,0,0);

    let expired = 0;
    let warning = 0;

    licenses.forEach(l => {
      const expDate = new Date(l.expirationDate);
      expDate.setHours(0,0,0,0);

      if (expDate < today) {
        expired++;
      } else if (expDate <= warningThreshold) {
        warning++;
      }
    });

    return { expired, warning };
  }, [licenses]);

  return (
    <Layout 
      currentView={view} 
      setCurrentView={setView}
      notificationCounts={notificationCounts}
    >
      {view === 'dashboard' && (
        <Dashboard 
          companies={companies} 
          licenses={licenses}
          onNavigate={(v) => setView(v)}
        />
      )}
      {view === 'companies' && (
        <CompanyManager 
          companies={companies} 
          onAdd={handleAddCompany}
          onEdit={handleEditCompany}
          onDelete={handleDeleteCompany}
        />
      )}
      {view === 'licenses' && (
        <LicenseManager 
          licenses={licenses}
          companies={companies}
          onAdd={handleAddLicense}
          onEdit={handleEditLicense}
          onDelete={handleDeleteLicense}
        />
      )}
      {view === 'reports' && (
        <Reports 
          companies={companies}
          licenses={licenses}
        />
      )}
      {view === 'settings' && <Settings onDataRestored={refreshData} />}
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;