
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { TrainingData, ApiConfig } from "../types";

export const generateProposal = async (
  summary: string, 
  trainingData?: TrainingData, 
  extraInstructions?: string,
  apiConfig?: ApiConfig
): Promise<string> => {
  
  // Determine Provider and Key
  const provider = apiConfig?.provider || 'gemini';
  // If user provided a key, use it. Otherwise fallback to env var (only for Gemini default).
  const apiKey = apiConfig?.apiKey || (provider === 'gemini' ? process.env.API_KEY : '');

  if (!apiKey && provider !== 'gemini') {
    throw new Error(`API Key is required for ${provider}. Please configure it in settings.`);
  }
  
  // Fallback for Gemini if no user key and no env key
  if (provider === 'gemini' && !apiKey) {
     throw new Error("API Key is missing. Please configure it in settings.");
  }

  // Construct the training context
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
    // --- GEMINI HANDLER ---
    if (provider === 'gemini') {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: apiConfig?.model || 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.45, 
        },
      });

      if (response.text) {
        return response.text;
      } else {
        throw new Error("No content generated.");
      }
    }

    // --- OPENAI / GROQ HANDLER ---
    if (provider === 'openai' || provider === 'groq') {
       const baseUrl = provider === 'openai' 
         ? 'https://api.openai.com/v1/chat/completions' 
         : 'https://api.groq.com/openai/v1/chat/completions';
       
       const defaultModel = provider === 'openai' ? 'gpt-4o' : 'llama3-70b-8192';
       const model = apiConfig?.model || defaultModel;

       const response = await fetch(baseUrl, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${apiKey}`
         },
         body: JSON.stringify({
           model: model,
           messages: [
             { role: "system", content: SYSTEM_PROMPT },
             { role: "user", content: userPrompt }
           ],
           temperature: 0.5
         })
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error?.message || `Failed to fetch from ${provider}`);
       }

       const data = await response.json();
       return data.choices[0]?.message?.content || "";
    }

    throw new Error("Unsupported provider selected.");

  } catch (error) {
    console.error(`${provider} API Error:`, error);
    throw error;
  }
};
