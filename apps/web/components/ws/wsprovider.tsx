"use client";
import { createContext, useContext, useMemo, useRef } from "react";

type WSContextType = { socket: WebSocket | null };
const WSContext = createContext<WSContextType>({ socket: null });

export function WSProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<WebSocket | null>(null);
  const value = useMemo(() => ({ socket: socketRef.current }), []);
  return <WSContext.Provider value={value}>{children}</WSContext.Provider>;
}

export function useWS() {
  return useContext(WSContext);
}
