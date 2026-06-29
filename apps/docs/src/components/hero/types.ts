export type CardType = 'strategy' | 'platform' | 'stats' | 'system';

export interface CardData {
  id: string;
  tag: string;
  title: string;
  description: string;
  type: CardType;
  // customizable floating overrides if needed
  floatDuration?: number;
  floatAmplitudeY?: number;
  floatAmplitudeRotate?: number;
}

export interface HeroProps {
  title?: string;
  subtitle?: string;
  cards?: CardData[];
  ctaText?: string;
  onSearchSubmit?: (query: string) => void;
}
