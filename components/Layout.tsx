import React, { useState } from 'react';
import { View } from '../types';
import { LayoutDashboard, Building2, FileBadge, Menu, X, AlertTriangle, ArrowRight, Settings, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  setCurrentView: (view: View) => void;
  notificationCounts?: {
    expired: number;
    warning: number;
  };
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setCurrentView, notificationCounts }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const { colors } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'companies', label: 'Empresas', icon: Building2 },
    { id: 'licenses', label: 'Licenças', icon: FileBadge },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const hasNotifications = notificationCounts && (notificationCounts.expired > 0 || notificationCounts.warning > 0);
  const isCritical = notificationCounts?.expired && notificationCounts.expired > 0;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden w-full transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 dark:bg-slate-950 text-white transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          safe-top safe-bottom
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <h1 className={`text-xl font-bold bg-gradient-to-r ${colors.gradientFrom} to-cyan-400 bg-clip-text text-transparent leading-tight`}>
              C & E CONTABILIDADE
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as View);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? `${colors.bg} text-white shadow-lg shadow-black/20` 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-base">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 safe-bottom">
            <div className="flex items-center space-x-3 bg-slate-800/50 p-3 rounded-xl">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${colors.gradientFrom} to-blue-500 flex items-center justify-center font-bold shadow-lg`}>
                CE
              </div>
              <div>
                <p className="text-sm font-medium text-white">Administrador</p>
                <p className="text-xs text-slate-400">Contabilidade</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
        {/* Mobile Header (Fixed) */}
        <header className="bg-white dark:bg-slate-800 shadow-sm lg:hidden h-16 flex items-center px-4 shrink-0 z-30 safe-top sticky top-0">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 dark:text-gray-300 p-2 -ml-2 rounded-lg active:bg-gray-100 dark:active:bg-slate-700">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-3 font-semibold text-gray-800 dark:text-white truncate">C & E CONTABILIDADE</span>
          
          {/* Mobile notification indicator */}
          {hasNotifications && (
            <div className="ml-auto flex items-center">
              <span className={`w-3 h-3 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
            </div>
          )}
        </header>

        {/* Notification Banner (Desktop & Mobile) */}
        {hasNotifications && isBannerVisible && (
          <div className={`${isCritical ? 'bg-red-600' : 'bg-amber-500'} text-white shadow-md z-20 shrink-0`}>
             <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                   <div className="p-1.5 bg-white/20 rounded-full shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                   </div>
                   <div className="text-sm font-medium leading-tight">
                      {isCritical ? (
                        <span>
                           <strong>Atenção!</strong> {notificationCounts.expired} licença(s) vencida(s).
                        </span>
                      ) : (
                        <span>
                           <strong>Alerta:</strong> {notificationCounts.warning} vencendo em breve.
                        </span>
                      )}
                   </div>
                </div>
                
                <div className="flex items-center gap-3 ml-auto">
                   <button 
                     onClick={() => setCurrentView('licenses')}
                     className="text-xs sm:text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
                   >
                     Ver <span className="hidden sm:inline">Licenças</span> <ArrowRight className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => setIsBannerVisible(false)}
                     className="text-white/80 hover:text-white p-1"
                   >
                     <X className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8 bg-gray-50 dark:bg-slate-900 safe-bottom transition-colors duration-200">
          <div className="max-w-7xl mx-auto h-full pb-20 lg:pb-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;