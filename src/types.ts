export interface AnalysisResult {
  id: string;
  timestamp: string;
  department: string;
  urgency: string;
  originalLanguage: string;
  sentimentScore: number;
  entities: string[];
  englishTranslation?: string;
  actionItems: string[];
  isPiiDetected?: boolean;
  confidenceScore?: number;
  suggestedArticles?: {
    title: string;
    url: string;
  }[];
  autoResponse: string;
  originalText: string;
}

export type Tone = 'professional' | 'empathetic' | 'direct' | 'technical';
