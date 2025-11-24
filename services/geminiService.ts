

import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProposal = async (summary: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const userPrompt = `
  *Input (Job Description & Context):*
  ${summary}

  *Instructions:*
  1. Extract job requirements and freelancer context.
  2. Generate a proposal following the System Prompt's Gold Standard Formats.
  3. **CRITICAL:** Keep the output concise (approx. 10% shorter than standard). aim for maximum impact with minimum words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.4, 
      },
    });

    if (response.text) {
      return response.text;
    } else {
      throw new Error("No content generated.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};