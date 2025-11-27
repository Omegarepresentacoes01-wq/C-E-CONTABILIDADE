import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CompanyManager from './components/CompanyManager';
import LicenseManager from './components/LicenseManager';
import AIAdvisor from './components/AIAdvisor';
import Settings from './components/Settings';
import Reports from './components/Reports';
import { View, Company, License } from './types';
import * as storage from './services/storageService';
import { generateEmailDraft } from './services/geminiService';
import { Copy, X, Loader2, Mail } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

function AppContent() {
  const [view, setView] = useState<View>('dashboard');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  
  const { colors, theme } = useTheme();

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);
  const [selectedLicenseForEmail, setSelectedLicenseForEmail] = useState<{c: Company, l: License} | null>(null);

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

  // AI Email Logic
  const handleDraftEmail = async (company: Company, license: License) => {
    setSelectedLicenseForEmail({ c: company, l: license });
    setEmailModalOpen(true);
    setIsGeneratingEmail(true);
    setEmailContent('');

    const today = new Date();
    today.setHours(0,0,0,0);
    const expDate = new Date(license.expirationDate);
    expDate.setHours(0,0,0,0);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const draft = await generateEmailDraft(
      company.name,
      license.number,
      new Date(license.expirationDate).toLocaleDateString('pt-BR'),
      diffDays
    );
    
    setEmailContent(draft);
    setIsGeneratingEmail(false);
  };

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
          onDraftEmail={handleDraftEmail}
        />
      )}
      {view === 'reports' && (
        <Reports 
          companies={companies}
          licenses={licenses}
        />
      )}
      {view === 'advisor' && (
        <AIAdvisor 
          companies={companies} 
          licenses={licenses} 
        />
      )}
      {view === 'settings' && <Settings onDataRestored={refreshData} />}

      {/* AI Email Result Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                   <div className={`${colors.bgLight} dark:bg-slate-700 p-2 rounded-lg ${colors.text} dark:text-white`}>
                     <Mail className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="font-bold text-gray-800 dark:text-white">Rascunho de E-mail</h3>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Gerado por IA para {selectedLicenseForEmail?.c.name}</p>
                   </div>
                </div>
                <button onClick={() => setEmailModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-800 relative">
                {isGeneratingEmail ? (
                  <div className="flex flex-col items-center justify-center h-40 space-y-3">
                    <Loader2 className={`w-8 h-8 ${colors.text} animate-spin`} />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Escrevendo e-mail...</p>
                  </div>
                ) : (
                  <textarea 
                    className={`w-full h-64 p-4 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg text-gray-700 leading-relaxed resize-none focus:ring-2 ${colors.ring} focus:outline-none`}
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                  />
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex justify-end gap-3">
                <button 
                   onClick={() => setEmailModalOpen(false)}
                   className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Fechar
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(emailContent);
                    alert('Copiado para a área de transferência!');
                  }}
                  disabled={isGeneratingEmail}
                  className={`px-4 py-2 text-sm font-medium text-white ${colors.bg} ${colors.bgHover} rounded-lg flex items-center shadow-sm disabled:opacity-50`}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Texto
                </button>
              </div>
           </div>
        </div>
      )}
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