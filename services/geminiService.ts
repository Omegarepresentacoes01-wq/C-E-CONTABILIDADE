import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("❌ ERRO: VITE_GEMINI_API_KEY não encontrada.");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function gerarTexto(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    return result.response.text();

  } catch (error) {
    console.error("Erro ao gerar conteúdo:", error);
    throw error;
  }
}
