
export interface ProposalRequest {
  summary: string;
}

export interface ProposalResponse {
  proposalText: string;
}

export interface TrainingData {
  customInstructions: string;
  examples: string[]; 
  isLocked: boolean;
}

export type AIProvider = 'gemini' | 'openai' | 'groq';

export interface ApiConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface Proposal {
  id: string;
  job_description: string;
  proposal_text: string;
  created_at: string;
  user_id?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
