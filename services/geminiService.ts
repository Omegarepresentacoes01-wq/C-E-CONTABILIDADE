import { GoogleGenAI } from "@google/genai";
import { Company, License } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateEmailDraft = async (
  companyName: string,
  licenseNumber: string,
  expirationDate: string,
  daysRemaining: number
): Promise<string> => {
  try {
    const prompt = `
      Atue como um assistente administrativo experiente em uma contabilidade brasileira.
      Escreva um e-mail formal, porém cordial, para o cliente da empresa "${companyName}".
      O assunto é: Alerta de Vencimento de Licença Sanitária.
      
      Detalhes:
      - Número da Licença: ${licenseNumber}
      - Data de Vencimento: ${expirationDate}
      - Dias restantes: ${daysRemaining}
      
      O objetivo é informar que a licença vai vencer em breve (ou já venceu, se dias restantes for negativo) e que precisamos iniciar o processo de renovação urgente para evitar multas.
      Solicite que entrem em contato para providenciar a documentação.
      
      Retorne APENAS o corpo do e-mail. Não inclua o assunto no corpo.
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
  try {
    // Preparar resumo dos dados para o contexto
    // Filtramos campos desnecessários para economizar tokens e focamos no essencial
    const companiesContext = data.companies.map(c => ({
      id: c.id,
      name: c.name,
      cnpj: c.cnpj,
      city: c.city
    }));

    const licensesContext = data.licenses.map(l => ({
      companyId: l.companyId,
      number: l.number,
      authority: l.authority, // Aqui pode entrar Alvará, CND, Licença
      issueDate: l.issueDate,
      expirationDate: l.expirationDate,
      notes: l.notes
    }));

    const contextString = JSON.stringify({ companies: companiesContext, documents: licensesContext });

    const prompt = `
      Você é o "C&E AI Advisor", um consultor especialista em contabilidade e legislação sanitária/empresarial.
      
      CONTEXTO DE DADOS ATUAL (Base de Dados do Usuário):
      ${contextString}

      PERGUNTA DO USUÁRIO:
      "${question}"

      INSTRUÇÕES ESTRITAS:
      1. Você tem acesso total aos dados acima. Se o usuário perguntar sobre "minhas empresas", "vencimentos", "Alvarás" ou "CNDs", USE OS DADOS fornecidos para responder especificamente.
      2. O termo "documents" no JSON inclui Licenças Sanitárias, Alvarás de Funcionamento e Certidões Negativas (CNDs), dependendo do campo 'authority' ou 'notes'. 
      3. Se o usuário pedir para verificar pendências, analise as datas de vencimento ('expirationDate') em relação à data de hoje (${new Date().toLocaleDateString('pt-BR')}).
      4. Se o usuário perguntar sobre Alvarás ou CNDs e não houver registros explícitos, avise que não encontrou esses documentos específicos cadastrados para a empresa citada e sugira o cadastro.
      5. Seja proativo: Se notar uma empresa sem nenhum documento, alerte.
      6. Mantenha o tom profissional, direto e em Português do Brasil.
      7. Formate a resposta com quebras de linha e tópicos para facilitar a leitura.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não consegui processar os dados no momento.";
  } catch (error) {
     console.error("Erro ao chamar Gemini API:", error);
     return "Ocorreu um erro ao analisar os dados da sua contabilidade.";
  }
}

// Deprecated simple function (kept for backward compatibility if needed, but UI now uses the one above)
export const askRegulationQuestion = async (question: string): Promise<string> => {
   return askContextAwareAssistant(question, { companies: [], licenses: [] });
}