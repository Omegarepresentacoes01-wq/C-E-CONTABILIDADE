import { GoogleGenAI } from "@google/genai";
import { Company, License } from "../types";

// Fix: Declare process to avoid TypeScript errors when accessing process.env
declare const process: any;

// Fix: The API key must be obtained exclusively from process.env.API_KEY as per guidelines.
// We assume this is configured in the build environment (e.g. via Vite define).
const apiKey = process.env.API_KEY;

// Inicialização segura da instância da IA
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({ apiKey: apiKey });
  } catch (error) {
    console.error("Erro ao inicializar GoogleGenAI:", error);
  }
} else {
  // Apenas loga no console, não trava a aplicação
  console.warn("⚠️ API Key do Gemini não encontrada. Configure VITE_GEMINI_API_KEY no .env ou na Vercel.");
}

export const generateEmailDraft = async (
  companyName: string,
  licenseNumber: string,
  expirationDate: string,
  daysRemaining: number
): Promise<string> => {
  if (!ai || !apiKey) {
    return "Erro: Chave de API do Gemini não configurada. Configure a variável VITE_GEMINI_API_KEY.";
  }

  try {
    const prompt = `
      Atue como um assistente administrativo experiente em uma contabilidade brasileira.
      Escreva um e-mail formal, porém cordial, para o cliente da empresa "${companyName}".
      O assunto é: Alerta de Vencimento de Licença Sanitária.
      
      Detalhes:
      - Número da Licença: ${licenseNumber}
      - Data de Vencimento: ${expirationDate}
      - Dias restantes: ${daysRemaining}
      
      O objetivo é informar que a licença vai vencer em breve (ou já venceu) e que precisamos iniciar a renovação.
      Retorne APENAS o corpo do e-mail.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar o e-mail no momento.";
  } catch (error) {
    console.error("Erro ao chamar Gemini API:", error);
    return "Erro ao conectar com o assistente inteligente.";
  }
};

export const askContextAwareAssistant = async (
  question: string, 
  data: { companies: Company[], licenses: License[] }
): Promise<string> => {
  if (!ai || !apiKey) {
    return "O assistente de IA está desativado. Chave de API não configurada.";
  }

  try {
    const companiesContext = data.companies.map(c => ({
      name: c.name,
      cnpj: c.cnpj,
      city: c.city
    }));

    const licensesContext = data.licenses.map(l => ({
      companyId: l.companyId,
      number: l.number,
      authority: l.authority,
      expirationDate: l.expirationDate
    }));

    const contextString = JSON.stringify({ companies: companiesContext, documents: licensesContext });

    const prompt = `
      Você é o "C&E AI Advisor".
      CONTEXTO DE DADOS: ${contextString}
      PERGUNTA: "${question}"
      Responda com base nos dados acima. Seja direto.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não consegui processar os dados no momento.";
  } catch (error) {
     console.error("Erro ao chamar Gemini API:", error);
     return "Ocorreu um erro ao analisar os dados. Tente novamente mais tarde.";
  }
}

// Compatibilidade
export const askRegulationQuestion = async (question: string): Promise<string> => {
   return askContextAwareAssistant(question, { companies: [], licenses: [] });
}