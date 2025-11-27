import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { TrainingData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProposal = async (summary: string, trainingData?: TrainingData, extraInstructions?: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  // Construct the training context if provided
  let trainingContext = "";
  
  if (trainingData) {
    if (trainingData.customInstructions.trim()) {
      trainingContext += `
      \n*** USER CUSTOM INSTRUCTIONS ***
      The user has provided specific instructions for their persona/style. You MUST incorporate these:
      "${trainingData.customInstructions}"
      `;
    }

    if (trainingData.examples && trainingData.examples.length > 0) {
      trainingContext += `
      \n*** USER STYLE REFERENCE LIBRARY ***
      Here are examples of previous winning proposals written by the user. 
      Analyze the tone, sentence structure, vocabulary, and sign-offs. 
      Mimic this writing style exactly, but apply it to the new job description.
      `;
      
      trainingData.examples.forEach((example, index) => {
        trainingContext += `
        \n--- EXAMPLE ${index + 1} ---
        ${example}
        `;
      });
      
      trainingContext += `\n--- END EXAMPLES ---`;
    }
  }

  if (extraInstructions && extraInstructions.trim()) {
    trainingContext += `
    \n*** ADDITIONAL INSTRUCTIONS ***
    The user provided the following extra instructions for this specific proposal:
    "${extraInstructions}"
    `;
  }

  const userPrompt = `
  ${trainingContext}

  *Input (Job Description & Context):*
  ${summary}

  *Instructions:*
  1. Extract job requirements and freelancer context.
  2. Generate a proposal following the System Prompt's Gold Standard Formats.
  3. If User Style References were provided, prioritize that TONE over the generic system tone, but keep the Gold Standard STRUCTURE.
  4. **CRITICAL:** Keep the output concise (approx. 10% shorter than standard). Aim for maximum impact with minimum words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.45, // Slightly higher to allow style adaptation
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