import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }
  return key;
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
}

export function getGeminiClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: getGeminiApiKey() });
  }
  return client;
}
