import React, { useState } from 'react';
import { Company } from '../types';
import { Plus, Search, Trash2, Edit2, Building2, MapPin, Phone, Mail, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CompanyManagerProps {
  companies: Company[];
  onAdd: (c: Company) => void;
  onEdit: (c: Company) => void;
  onDelete: (id: string) => void;
}

const CompanyManager: React.FC<CompanyManagerProps> = ({ companies, onAdd, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { colors } = useTheme();

  const [formData, setFormData] = useState<Omit<Company, 'id'>>({
    name: '',
    cnpj: '',
    city: '',
    contactName: '',
    email: '',
    phone: '',
  });

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

  const handleEdit = (company: Company) => {
    setFormData(company);
    setEditingId(company.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza? Isso também apagará as licenças desta empresa.')) {
      onDelete(id);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', cnpj: '', city: '', contactName: '', email: '', phone: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cnpj.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Empresas</h2>
          <p className="text-gray-500 dark:text-gray-400">Gerencie o cadastro dos seus clientes.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className={`${colors.bg} ${colors.bgHover} text-white px-4 py-2 rounded-lg flex items-center shadow-md transition-colors`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Nova Empresa
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 flex items-center">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input 
            type="text"
            placeholder="Buscar por nome ou CNPJ..."
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Empresa / CNPJ</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma empresa encontrada.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full ${colors.bgLight} dark:bg-slate-700 ${colors.text} dark:text-white flex items-center justify-center mr-3`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">{company.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{company.cnpj}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600 dark:text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                        {company.city}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-800 dark:text-white font-medium">{company.contactName}</p>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                          <Mail className="w-3 h-3 mr-1" /> {company.email}
                        </div>
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                          <Phone className="w-3 h-3 mr-1" /> {company.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => handleEdit(company)}
                          className={`p-1.5 hover:bg-gray-100 dark:hover:bg-slate-600 ${colors.text} dark:text-gray-300 rounded-md transition-colors`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(company.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
                {editingId ? 'Editar Empresa' : 'Nova Empresa'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Razão Social</label>
                  <input
                    required
                    type="text"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none transition-shadow`}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
                    <input
                      required
                      type="text"
                      placeholder="00.000.000/0000-00"
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`}
                      value={formData.cnpj}
                      onChange={e => setFormData({...formData, cnpj: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade</label>
                    <input
                      required
                      type="text"
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`}
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                </div>
                <div className="border-t border-gray-100 dark:border-slate-700 pt-2 mt-2">
                   <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">Dados de Contato</p>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Contato</label>
                    <input
                      required
                      type="text"
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`}
                      value={formData.contactName}
                      onChange={e => setFormData({...formData, contactName: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
                      <input
                        required
                        type="email"
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`}
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                      <input
                        required
                        type="tel"
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 ${colors.ring} focus:outline-none`}
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
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
                  {editingId ? 'Salvar Alterações' : 'Criar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyManager;