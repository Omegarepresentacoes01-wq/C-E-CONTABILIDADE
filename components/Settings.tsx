import React, { useRef } from 'react';
import { createBackup, restoreBackup, clearSystemData } from '../services/storageService';
import { Download, Upload, ShieldCheck, Database, RefreshCw, Moon, Sun, Palette, Trash } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { PrimaryColor } from '../types';

interface SettingsProps {
  onDataRestored: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onDataRestored }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme, primaryColor, setPrimaryColor, colors } = useTheme();

  const handleDownloadBackup = () => {
    const jsonString = createBackup();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_ce_contabilidade_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        if (confirm('Atenção: Importar um backup substituirá todos os dados atuais. Deseja continuar?')) {
          const success = restoreBackup(content);
          if (success) {
            alert('Dados restaurados com sucesso!');
            onDataRestored();
          } else {
            alert('Erro ao restaurar arquivo. Verifique se o formato é válido.');
          }
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleResetSystem = () => {
    if (confirm('TEM CERTEZA? Isso apagará TODAS as empresas e licenças cadastradas neste navegador. Esta ação é irreversível.')) {
      clearSystemData();
      onDataRestored();
      alert('Sistema limpo com sucesso.');
    }
  };

  const colorOptions: { id: PrimaryColor, label: string, bg: string }[] = [
    { id: 'teal', label: 'Teal', bg: 'bg-teal-600' },
    { id: 'blue', label: 'Azul', bg: 'bg-blue-600' },
    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-600' },
    { id: 'violet', label: 'Violeta', bg: 'bg-violet-600' },
    { id: 'rose', label: 'Rosa', bg: 'bg-rose-600' },
    { id: 'amber', label: 'Âmbar', bg: 'bg-amber-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Configurações</h2>
        <p className="text-gray-500 dark:text-gray-400">Gerencie a aparência e os dados do sistema.</p>
      </div>

      {/* Appearance Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Palette className="w-5 h-5" /> Aparência
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Theme Mode */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
             <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-4">Modo de Exibição</h4>
             <div className="flex gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${theme === 'light' ? `${colors.border} bg-gray-50 dark:bg-slate-700` : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                  <Sun className={`w-6 h-6 ${theme === 'light' ? colors.text : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Claro</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${theme === 'dark' ? `${colors.border} bg-gray-50 dark:bg-slate-700` : 'border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                  <Moon className={`w-6 h-6 ${theme === 'dark' ? colors.text : 'text-gray-400'}`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Escuro</span>
                </button>
             </div>
          </div>

          {/* Primary Color */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-4">Cor de Destaque</h4>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setPrimaryColor(color.id)}
                  className={`p-2 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${primaryColor === color.id ? 'border-gray-900 dark:border-white' : 'border-transparent hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                >
                  <div className={`w-6 h-6 rounded-full ${color.bg} shadow-sm`}></div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{color.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5" /> Dados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Card */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className={`w-16 h-16 ${colors.bgLight} dark:bg-slate-700 rounded-full flex items-center justify-center mb-4`}>
              <Download className={`w-8 h-8 ${colors.text} dark:text-white`} />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Fazer Backup</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Baixe uma cópia completa de todas as empresas e licenças cadastradas.
            </p>
            <button 
              onClick={handleDownloadBackup}
              className={`w-full py-3 px-4 ${colors.bg} ${colors.bgHover} text-white rounded-lg font-medium transition-colors flex items-center justify-center`}
            >
              <Database className="w-4 h-4 mr-2" />
              Baixar Dados
            </button>
          </div>

          {/* Import Card */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-slate-600 dark:text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Restaurar Backup</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Recupere seus dados enviando um arquivo de backup (.json). Substitui dados atuais.
            </p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleUploadBackup}
              accept=".json"
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Selecionar Arquivo
            </button>
          </div>
        </div>

         {/* Reset System Button */}
         <div className="mt-4 flex justify-end">
            <button 
              onClick={handleResetSystem}
              className="text-red-500 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <Trash className="w-4 h-4" />
              Resetar Sistema (Limpar Tudo)
            </button>
         </div>

        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 mt-6">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-slate-500 dark:text-slate-400 mt-1" />
            <div>
                <h4 className="font-semibold text-slate-800 dark:text-white">Como funciona o armazenamento?</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Este sistema utiliza tecnologia "Local-First". Seus dados ficam salvos exclusivamente no seu navegador para garantir privacidade e velocidade.
                </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;