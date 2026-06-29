export type CarouselItem = {
  id: string;
  image: any;
  title?: string;
  subtitle?: string;
};

export interface CoverflowCarouselProps {
  items: CarouselItem[];
  initialIndex?: number;
  autoPlay?: boolean;
  interval?: number;
  loop?: boolean;
  className?: string;
}
