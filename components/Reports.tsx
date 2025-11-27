import React from 'react';
import { Company, License, LicenseStatus } from '../types';
import { FileDown, FileSpreadsheet, FileText, Filter, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { generatePDF, generateExcel } from '../services/reportService';

interface ReportsProps {
  companies: Company[];
  licenses: License[];
}

const Reports: React.FC<ReportsProps> = ({ companies, licenses }) => {
  const { colors } = useTheme();

  const handleDownload = (type: 'pdf' | 'excel', filter?: LicenseStatus, title: string = 'Relatório Geral') => {
    if (type === 'pdf') {
      generatePDF(companies, licenses, title, filter);
    } else {
      generateExcel(companies, licenses, title.toLowerCase().replace(/\s+/g, '_'), filter);
    }
  };

  const ReportCard = ({ 
    title, 
    description, 
    icon: Icon, 
    iconColor, 
    filter,
    count 
  }: { 
    title: string; 
    description: string; 
    icon: any; 
    iconColor: string;
    filter?: LicenseStatus;
    count: number;
  }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className={`w-12 h-12 rounded-lg ${colors.bgLight} dark:bg-slate-700 flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{description}</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-6">Total de Registros: {count}</p>
      </div>
      
      <div className="flex gap-3 mt-auto">
        <button
          onClick={() => handleDownload('pdf', filter, title)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-100 dark:border-red-900/30"
        >
          <FileText className="w-4 h-4" /> PDF
        </button>
        <button
          onClick={() => handleDownload('excel', filter, title)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm font-medium transition-colors border border-emerald-100 dark:border-emerald-900/30"
        >
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </button>
      </div>
    </div>
  );

  const activeCount = licenses.filter(l => {
     // Helper logic duplicated for display count - ideally centralized
     const today = new Date(); today.setHours(0,0,0,0);
     const exp = new Date(l.expirationDate); exp.setHours(0,0,0,0);
     const warn = new Date(); warn.setDate(today.getDate() + 30); warn.setHours(0,0,0,0);
     return exp > warn;
  }).length;

  const warningCount = licenses.filter(l => {
     const today = new Date(); today.setHours(0,0,0,0);
     const exp = new Date(l.expirationDate); exp.setHours(0,0,0,0);
     const warn = new Date(); warn.setDate(today.getDate() + 30); warn.setHours(0,0,0,0);
     return exp >= today && exp <= warn;
  }).length;

  const expiredCount = licenses.filter(l => {
     const today = new Date(); today.setHours(0,0,0,0);
     const exp = new Date(l.expirationDate); exp.setHours(0,0,0,0);
     return exp < today;
  }).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Central de Relatórios</h2>
        <p className="text-gray-500 dark:text-gray-400">Exporte os dados do sistema para PDF ou Excel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* General Report */}
        <ReportCard 
          title="Relatório Geral" 
          description="Todas as licenças e empresas cadastradas no sistema."
          icon={FileDown}
          iconColor={colors.text}
          count={licenses.length}
        />

        {/* Expired Report */}
        <ReportCard 
          title="Licenças Vencidas" 
          description="Apenas licenças que já expiraram e precisam de ação imediata."
          icon={AlertCircle}
          iconColor="text-red-500"
          filter={LicenseStatus.EXPIRED}
          count={expiredCount}
        />

        {/* Warning Report */}
        <ReportCard 
          title="A Vencer (Próximos 30 dias)" 
          description="Licenças que vencerão em breve."
          icon={AlertTriangle}
          iconColor="text-amber-500"
          filter={LicenseStatus.WARNING}
          count={warningCount}
        />

        {/* Active Report */}
        <ReportCard 
          title="Licenças Regulares" 
          description="Licenças ativas e sem pendências urgentes."
          icon={CheckCircle2}
          iconColor="text-emerald-500"
          filter={LicenseStatus.ACTIVE}
          count={activeCount}
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-6 mt-8">
        <div className="flex items-start gap-4">
          <Filter className="w-6 h-6 text-blue-500 dark:text-blue-400 mt-1" />
          <div>
            <h4 className="font-semibold text-blue-800 dark:text-blue-300">Dica sobre Relatórios</h4>
            <p className="text-sm text-blue-700 dark:text-blue-200 mt-1 leading-relaxed">
              Os relatórios em Excel (.xlsx) são ideais para manipulação de dados e criação de planilhas personalizadas. 
              Já os relatórios em PDF são formatados para impressão e envio direto aos clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;