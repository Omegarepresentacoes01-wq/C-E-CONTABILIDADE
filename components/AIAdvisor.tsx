import React, { useState } from 'react';
import { askContextAwareAssistant } from '../services/geminiService';
import { Bot, Send, Loader2, Sparkles, MessageSquare, FileCheck, AlertTriangle, Building, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Company, License } from '../types';

interface AIAdvisorProps {
  companies: Company[];
  licenses: License[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ companies, licenses }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{q: string, a: string}[]>([]);
  const { colors } = useTheme();

  const handleAsk = async (customQuestion?: string) => {
    const query = customQuestion || question;
    if (!query.trim()) return;

    // Se for uma pergunta via clique de botão, atualiza o input visualmente
    if (customQuestion) setQuestion(customQuestion);

    setLoading(true);
    setAnswer('');
    
    // Passamos os dados reais para a IA
    const response = await askContextAwareAssistant(query, { companies, licenses });
    
    setAnswer(response);
    setHistory(prev => [{q: query, a: response}, ...prev].slice(0, 5)); // Keep last 5
    setLoading(false);
  };

  const quickActions = [
    { 
      label: "Análise Geral de Vencimentos", 
      prompt: "Faça um resumo executivo de todas as licenças vencidas e a vencer nos próximos 30 dias, citando as empresas.",
      icon: AlertTriangle,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20"
    },
    { 
      label: "Verificar Alvarás e CNDs", 
      prompt: "Analise as empresas cadastradas e verifique quais possuem documentos identificados como 'Alvará' ou 'CND/Certidão'. Liste as empresas que parecem não ter esses documentos cadastrados.",
      icon: FileCheck,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20"
    },
    { 
      label: "Pendências por Empresa", 
      prompt: "Liste todas as empresas cadastradas e, para cada uma, diga quantos documentos ativos e quantos vencidos ela possui.",
      icon: Building,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
    },
    { 
      label: "Legislação Sanitária", 
      prompt: "Quais são as principais exigências atuais da ANVISA para renovação de licença de farmácias e restaurantes?",
      icon: Search,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className={`inline-flex items-center justify-center p-3 bg-gradient-to-br ${colors.gradientFrom} to-purple-600 rounded-2xl shadow-lg mb-4`}>
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Assistente Regulatório Inteligente</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">
          Analise seus dados cadastrados (Licenças, Alvarás, CNDs) ou tire dúvidas sobre legislação.
          A IA tem acesso total ao seu banco de dados atual.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleAsk(action.prompt)}
            disabled={loading}
            className="flex items-start p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl hover:shadow-md transition-all text-left group"
          >
            <div className={`p-2.5 rounded-lg mr-4 ${action.color} group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-white text-sm">{action.label}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{action.prompt}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className={`bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-md border border-gray-100 dark:border-slate-700 flex items-center gap-2 max-w-3xl mx-auto focus-within:ring-2 ${colors.ring} transition-all`}>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ex: Como está a situação da Padaria Sabor do Trigo?"
          className="flex-1 px-4 py-3 bg-transparent outline-none text-gray-700 dark:text-white placeholder-gray-400"
          disabled={loading}
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className={`p-3 ${colors.bg} ${colors.bgHover} text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>

      {/* Current Answer */}
      {answer && (
        <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg border ${colors.border} dark:border-slate-700 overflow-hidden mt-8 animate-in fade-in slide-in-from-bottom-2`}>
          <div className={`${colors.bgLight} dark:bg-slate-700 px-6 py-3 border-b ${colors.border} dark:border-slate-600 flex items-center gap-2`}>
             <Sparkles className={`w-4 h-4 ${colors.text} dark:text-white`} />
             <span className={`font-semibold ${colors.text} dark:text-white text-sm`}>Análise da IA</span>
          </div>
          <div className="p-6 text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap markdown-body">
            {answer}
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Histórico de Conversa</h3>
             <button onClick={() => setHistory([])} className="text-xs text-red-400 hover:text-red-500">Limpar</button>
          </div>
          <div className="space-y-4">
            {history.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                  <div className="w-full">
                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">{item.q}</p>
                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-slate-900 p-3 rounded border border-gray-100 dark:border-slate-700 whitespace-pre-wrap">
                      {item.a}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;