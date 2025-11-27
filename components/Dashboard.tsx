import React, { useMemo } from 'react';
import { Company, License, LicenseStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertCircle, CheckCircle2, AlertTriangle, Building, CalendarDays } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardProps {
  companies: Company[];
  licenses: License[];
  onNavigate: (view: 'licenses') => void;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444']; // Green, Amber, Red

const Dashboard: React.FC<DashboardProps> = ({ companies, licenses, onNavigate }) => {
  const { colors, theme } = useTheme();

  const stats = useMemo(() => {
    const today = new Date();
    const warningThreshold = new Date();
    warningThreshold.setDate(today.getDate() + 30); // 30 days warning

    let active = 0;
    let warning = 0;
    let expired = 0;

    licenses.forEach(l => {
      const expDate = new Date(l.expirationDate);
      // Reset time for accurate date comparison
      expDate.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      warningThreshold.setHours(0,0,0,0);

      if (expDate < today) {
        expired++;
      } else if (expDate <= warningThreshold) {
        warning++;
      } else {
        active++;
      }
    });

    return {
      active,
      warning,
      expired,
      totalCompanies: companies.length,
      totalLicenses: licenses.length
    };
  }, [licenses, companies]);

  const pieData = [
    { name: LicenseStatus.ACTIVE, value: stats.active },
    { name: LicenseStatus.WARNING, value: stats.warning },
    { name: LicenseStatus.EXPIRED, value: stats.expired },
  ];

  // Group expirations by month (last 12 months)
  const barData = useMemo(() => {
    const data: { name: string; fullName: string; count: number }[] = [];
    const today = new Date();
    
    // Loop for the last 12 months (current month + 11 previous months)
    for (let i = 11; i >= 0; i--) {
      // Calculate the date for 'i' months ago
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      
      // Formatting
      const monthShort = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      const monthFull = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
      const yearShort = d.getFullYear().toString().slice(2);
      
      const label = `${monthShort.charAt(0).toUpperCase() + monthShort.slice(1)}/${yearShort}`;
      const fullLabel = monthFull.charAt(0).toUpperCase() + monthFull.slice(1);

      const count = licenses.filter(l => {
        if (!l.expirationDate) return false;
        // Split date string to avoid timezone issues (YYYY-MM-DD)
        const [lYear, lMonth] = l.expirationDate.split('-').map(Number);
        
        // Check if year and month match (lMonth is 1-12, d.getMonth() is 0-11)
        return lMonth === (d.getMonth() + 1) && lYear === d.getFullYear();
      }).length;
      
      data.push({ name: label, fullName: fullLabel, count });
    }
    return data;
  }, [licenses]);

  const StatCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 dark:text-white">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  // Dynamic Chart Colors (Bar) - Using Hex approximates for simplicity since Recharts needs hex strings
  const barColor = theme === 'dark' ? '#60a5fa' : '#3b82f6'; // blue-400 vs blue-500
  const axisColor = theme === 'dark' ? '#9ca3af' : '#6b7280';
  const gridColor = theme === 'dark' ? '#374151' : '#f0f0f0';

  // Custom Tooltip for Bar Chart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-gray-100 dark:border-slate-600 rounded-lg shadow-lg">
          <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{data.fullName}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <CalendarDays className="w-4 h-4 text-blue-500" />
            <span>Total de Vencimentos: <strong>{data.count}</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Visão Geral</h2>
          <p className="text-gray-500 dark:text-gray-400">Acompanhamento em tempo real das licenças.</p>
        </div>
        <button 
          onClick={() => onNavigate('licenses')}
          className={`text-sm ${colors.text} hover:underline font-medium`}
        >
          Ver todas as licenças &rarr;
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Empresas" 
          value={stats.totalCompanies} 
          icon={Building} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Vencidas" 
          value={stats.expired} 
          icon={AlertCircle} 
          color="bg-red-500"
          subtext="Ação urgente necessária"
        />
        <StatCard 
          title="A Vencer (30 dias)" 
          value={stats.warning} 
          icon={AlertTriangle} 
          color="bg-amber-500"
          subtext="Renovação em breve"
        />
        <StatCard 
          title="Regulares" 
          value={stats.active} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Distribution Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Status das Licenças</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Licenças']}
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Histórico de Vencimentos (Últimos 12 meses)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: axisColor }} 
                  interval={0} // Show all labels if possible
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: axisColor }} allowDecimals={false} />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: theme === 'dark' ? '#334155' : '#f3f4f6' }} />
                <Bar dataKey="count" fill={barColor} radius={[4, 4, 0, 0]} barSize={24} name="Vencimentos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Companies List Section with CNPJ */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mt-6">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
           <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Empresas Cadastradas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
             <thead className="bg-gray-50 dark:bg-slate-900 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold">
                <tr>
                   <th className="px-6 py-4 text-left">Nome da Empresa</th>
                   <th className="px-6 py-4 text-left">CNPJ</th>
                   <th className="px-6 py-4 text-left">Cidade</th>
                   <th className="px-6 py-4 text-right">Licenças Gerenciadas</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {companies.length > 0 ? (
                  companies.map(company => {
                    const companyLicenses = licenses.filter(l => l.companyId === company.id).length;
                    return (
                        <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded ${colors.bgLight} dark:bg-slate-700 ${colors.text} dark:text-white flex items-center justify-center shrink-0`}>
                                    <Building className="w-4 h-4" />
                                </div>
                                {company.name}
                              </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                              {company.cnpj}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {company.city}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 text-right">
                              {companyLicenses}
                          </td>
                        </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      Nenhuma empresa cadastrada.
                    </td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions / Alerts */}
      {stats.expired > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
          <div>
            <h4 className="font-semibold text-red-800 dark:text-red-300">Atenção Necessária</h4>
            <p className="text-sm text-red-700 dark:text-red-200">
              Existem {stats.expired} licenças vencidas. Verifique a lista de licenças e entre em contato com os clientes imediatamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;