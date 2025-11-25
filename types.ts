export interface ProposalRequest {
  summary: string;
}

export interface ProposalResponse {
  proposalText: string;
}

export interface TrainingData {
  customInstructions: string;
  exampleProposal: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}