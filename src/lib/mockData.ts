import { AnalysisResult } from '../types';

export function generateMockHistory(count: number): AnalysisResult[] {
  const departments = ['technical_support', 'billing_and_finance', 'sales_and_partnerships', 'legal_and_compliance'];
  const urgencies = ['high', 'medium', 'low'];
  const languages = ['en', 'es', 'fr', 'de', 'pt'];
  
  const history: AnalysisResult[] = [];
  
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const timeOffset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000); // Up to 7 days
    const timestamp = new Date(now.getTime() - timeOffset).toISOString();
    
    // Bias towards 'en'
    const lang = Math.random() > 0.3 ? 'en' : languages[Math.floor(Math.random() * languages.length)];
    
    history.push({
      id: Math.random().toString(36).substring(7),
      timestamp,
      department: departments[Math.floor(Math.random() * departments.length)],
      urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
      originalLanguage: lang,
      sentimentScore: Math.floor(Math.random() * 5) + 1,
      entities: Math.random() > 0.5 ? ['Acme Corp', 'Invoice #1234'] : [],
      englishTranslation: lang !== 'en' ? 'Mock english translation of the request.' : '',
      actionItems: ['Review customer account history', 'Verify billing details manually'],
      isPiiDetected: Math.random() > 0.8,
      confidenceScore: Math.floor(Math.random() * 20) + 80, // 80-100
      suggestedArticles: [
        { title: 'How to Reset Password', url: 'reset-password' },
        { title: 'Billing Policies', url: 'billing' }
      ],
      autoResponse: 'This is a mock response.',
      originalText: 'This is a mock input email.',
    });
  }
  
  return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
