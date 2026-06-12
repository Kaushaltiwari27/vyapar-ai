"use client";

import React, { createContext, useContext, ReactNode } from 'react';

type PlanContextType = {
  plan: string;
};

const PlanContext = createContext<PlanContextType>({ plan: 'starter' });

export function PlanProvider({ children, initialPlan }: { children: ReactNode, initialPlan: string }) {
  return (
    <PlanContext.Provider value={{ plan: initialPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
