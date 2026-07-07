"use client";
import { createContext, useContext } from "react";
const CanvasWidthContext = createContext<number>(1200);
export const CanvasWidthProvider = CanvasWidthContext.Provider;
export function useCanvasWidth(): number {
  return useContext(CanvasWidthContext);
}
