"use client";

import { createContext, useContext } from "react";

export interface ScrollPathContextProps {
  scrollProgress: number;
}

export const ScrollPathContext = createContext<ScrollPathContextProps>({
  scrollProgress: 0,
});

export const useScrollPath = () => useContext(ScrollPathContext);
