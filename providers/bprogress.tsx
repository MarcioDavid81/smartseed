"use client";

import { AppProgressProvider } from "@bprogress/next"

export function ProgressProvider({children}: {children: React.ReactNode}) {
  return (
    <AppProgressProvider
      height="6px"
      color="#63B926"
      options={{
        showSpinner: false
      }}
      shallowRouting
    >
      {children}
    </AppProgressProvider>
  );
}