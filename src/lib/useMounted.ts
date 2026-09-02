"use client";

import { useEffect, useState } from "react";

/**
 * True only after the component has mounted on the client. Used to defer
 * rendering of anything that depends on browser APIs or persisted store state,
 * so the first client render matches the server HTML exactly.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one time mount flag, no server equivalent
    setMounted(true);
  }, []);
  return mounted;
}
