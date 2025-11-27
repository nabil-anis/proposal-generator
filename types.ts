export interface ProposalRequest {
  summary: string;
}

export interface ProposalResponse {
  proposalText: string;
}

export interface TrainingData {
  customInstructions: string;
  examples: string[]; // Changed from single string to array
  isLocked: boolean;  // New field to lock editing
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}