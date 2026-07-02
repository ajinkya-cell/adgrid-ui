/* Barrel export for TextShuffle component family */

export { TextShuffle } from "./TextShuffle";
export type { TextShuffleProps, TextShuffleRef, TextShuffleVariant, TextAlign, ShuffleVariantConfig } from "./types";
export { useShuffleCycle } from "./hooks/useShuffleCycle";
export { useShuffleVariants, createCharacterItemVariants } from "./hooks/useShuffleVariants";
export { AnimatedWord } from "./AnimatedWord";
export { splitCharacters, hasRTL } from "./utils/splitCharacters";
export { DEFAULT_DURATION, DEFAULT_TRANSITION, SPRING_CONFIG, ELASTIC_SPRING, SNAPPY_SPRING, FLIP_TRANSITION } from "./utils/timing";
