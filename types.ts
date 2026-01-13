export enum SeoModuleType {
  ON_PAGE = 'ON_PAGE',
  OFF_PAGE = 'OFF_PAGE',
  TECHNICAL = 'TECHNICAL',
  CONTENT = 'CONTENT',
  BLACK_HAT = 'BLACK_HAT',
  LOCAL = 'LOCAL'
}

export interface AnalysisIssue {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'PASSED';
  recommendation: string;
  canAutoFix: boolean;
  codeSnippet?: string; // Original problematic code if applicable
}

export interface AnalysisResult {
  score: number;
  summary: string;
  issues: AnalysisIssue[];
}

export interface FixResult {
  explanation: string;
  fixedCode: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
