export interface PropertyScoringFilterDto {
  [key: string]: any;
}

export interface PropertyScoringPropertyDto {
  id: string;
  [key: string]: any;
}

export interface ScoringResultDto {
  total_score: number;
  breakdown: {
    price: number;
    location: number;
    specs: number;
    lifestyle: number;
    timing: number;
    sentiment: number;
  };
  tier: string;
  explanation: string;
}
