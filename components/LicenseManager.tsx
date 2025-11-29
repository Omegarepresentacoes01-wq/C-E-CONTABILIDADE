import React, { useState } from 'react';
import { Company, License, LicenseStatus } from '../types';
import { Plus, Search, Trash2, Edit2, AlertCircle, Calendar, FileText } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LicenseManagerProps {
  licenses: License[];
  companies: Company[];
  onAdd: (l: License) => void;
  onEdit: (l: License) => void;
  onDelete: (id: string) => void;
}

const LicenseManager: React.FC<LicenseManagerProps> = ({ 
  licenses, 
  companies, 
  onAdd, 
  onEdit, 
  onDelete,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const { colors } = useTheme();

  const [formData, setFormData] = useState<Omit<License, 'id'>>({
    companyId: '',
    number: '',
    issueDate: '',
    expirationDate: '',
    authority: '',
    notes: ''
  });

  const getStatus = (expirationDate: string): LicenseStatus => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(expirationDate);
    exp.setHours(0,0,0,0);
    
    const warningDate = new Date();
    warningDate.setDate(today.getDate() + 30);
    warningDate.setHours(0,0,0,0);

    if (exp < today) return LicenseStatus.EXPIRED;
    if (exp <= warningDate) return LicenseStatus.WARNING;
    return LicenseStatus.ACTIVE;
  };

  const getStatusColor = (status: LicenseStatus) => {
    switch (status) {
      case LicenseStatus.ACTIVE: return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case LicenseStatus.WARNING: return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case LicenseStatus.EXPIRED: return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingId || crypto.randomUUID();
    if (editingId) {
      onEdit({ ...formData, id });
    } else {
      onAdd({ ...formData, id });
    }
    resetForm();
  };

  const handleEdit = (license: License) => {
    setFormData(license);
    setEditingId(license.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta licença? Esta ação não pode ser desfeita.')) {
      onDelete(id);
    }
  };

  const resetForm = () => {
    setFormData({ companyId: '', number: '', issueDate: '', expirationDate: '', authority: '', notes: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const filteredLicenses = licenses.filter(l => {
    const company = companies.find(c => c.id === l.companyId);
    const companyName = company ? company.name.toLowerCase() : '';
    const matchesSearch = 
      l.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
      companyName.includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'ALL') return matchesSearch;
    
    const status = getStatus(l.expirationDate);
    if (filterStatus === 'EXPIRED') return matchesSearch && status === LicenseStatus.EXPIRED;
    if (filterStatus === 'WARNING') return matchesSearch && status === LicenseStatus.WARNING;
    if (filterStatus === 'ACTIVE') return matchesSearch && status === LicenseStatus.ACTIVE;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Licenças Sanitárias</h2>
          <p className="text-gray-500 dark:text-gray-400">Controle de vencimentos e renovações.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`${colors.bg} ${colors.bgHover} text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-colors`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Licença
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          <input 
            type="text"
            placeholder="Buscar por número ou empresa..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 bg-transparent dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
            style={{ '--tw-ring-color': `var(--color-${colors.bg.split('-')[1]}-500)` } as any}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-2 overflow-x-auto pb-1 sm:pb-0">
           {['ALL', 'EXPIRED', 'WARNING', 'ACTIVE'].map((statusKey) => (
             <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${
                filterStatus === statusKey 
                ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-700 dark:border-slate-600' 
                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
             >
               {statusKey === 'ALL' ? 'Todas' : 
                statusKey === 'EXPIRED' ? 'Vencidas' : 
                statusKey === 'WARNING' ? 'A Vencer' : 'Ativas'}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Documento / Empresa</th>
                <th className="px-6 py-4">Emissão</th>
                <th className="px-6 py-4">Vencimento</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma licença encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredLicenses.map((license) => {
                  const company = companies.find(c => c.id === license.companyId);
                  const status = getStatus(license.expirationDate);
                  return (
                    <tr key={license.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                             <FileText className="w-4 h-4 text-gray-400" />
                             {license.number}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{company?.name || 'Empresa desconhecida'}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{license.authority}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(license.issueDate)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center text-sm font-medium ${
                          status === LicenseStatus.EXPIRED ? 'text-red-600 dark:text-red-400' : 
                          status === LicenseStatus.WARNING ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          <Calendar className="w-4 h-4 mr-1.5" />
                          {formatDate(license.expirationDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleEdit(license)}
                            className={`p-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 ${colors.text} dark:text-gray-300 rounded-md transition-colors`}
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(license.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-md transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900">
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                {editingId ? 'Editar Licença' : 'Nova Licença'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <AlertCircle className="w-5 h-5 rotate-45" /> 
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa</label>
                <select
                  required
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`}
                  value={formData.companyId}
                  onChange={e => setFormData({...formData, companyId: e.target.value})}
                >
                  <option value="">Selecione uma empresa...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.cnpj}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nº Documento</label>
                  <input
                    required
                    type="text"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`}
                    value={formData.number}
                    onChange={e => setFormData({...formData, number: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Órgão Emissor</label>
                   <input
                    required
                    type="text"
                    placeholder="Ex: VISA Municipal"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`}
                    value={formData.authority}
                    onChange={e => setFormData({...formData, authority: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Emissão</label>
                  <input
                    required
                    type="date"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`}
                    value={formData.issueDate}
                    onChange={e => setFormData({...formData, issueDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Vencimento</label>
                  <input
                    required
                    type="date"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`}
                    value={formData.expirationDate}
                    onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                <textarea
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none h-20 resize-none`}
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-sm font-medium text-white ${colors.bg} ${colors.bgHover} rounded-lg shadow-sm`}
                >
                  {editingId ? 'Salvar Alterações' : 'Registrar Licença'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LicenseManager;