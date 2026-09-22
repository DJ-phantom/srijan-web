"use client";

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { initGSAP } from "@/lib/gsap";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Custom hook for managing GSAP animation contexts safely in React components.
 * Automatically cleans up GSAP animations, timelines, and ScrollTriggers on unmount.
 */
export function useGSAP(
  effect: (context: gsap.Context) => void | (() => void),
  scope?: React.RefObject<Element | null> | Element | null
) {
  useIsomorphicLayoutEffect(() => {
    initGSAP();
    const ctx = gsap.context(
      effect,
      scope && "current" in scope ? scope.current || undefined : scope || undefined
    );
    return () => ctx.revert();
  }, [scope]);
}
