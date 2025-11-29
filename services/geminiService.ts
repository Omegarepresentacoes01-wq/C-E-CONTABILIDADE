import { Company, License } from "../types";

// As funcionalidades de IA foram removidas conforme solicitação.
// Este arquivo é mantido apenas para evitar que imports antigos quebrem o build se existirem em outros arquivos não migrados.

export const generateEmailDraft = async (
  companyName: string,
  licenseNumber: string,
  expirationDate: string,
  daysRemaining: number
): Promise<string> => {
    return "Funcionalidade de IA desativada.";
};

export const askContextAwareAssistant = async (
  question: string, 
  data: { companies: Company[], licenses: License[] }
): Promise<string> => {
    return "Funcionalidade de IA desativada.";
}

export const askRegulationQuestion = async (question: string): Promise<string> => {
   return "Funcionalidade de IA desativada.";
}