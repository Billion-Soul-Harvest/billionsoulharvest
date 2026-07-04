import type { Ref } from "react";

/**
 * Wraps Craft.js connector functions into a React 19-compatible ref callback.
 * Craft.js connectors return the DOM element, but React 19 ref callbacks must return
 * void or a cleanup function.
 */
export function craftRef<T extends HTMLElement>(
  ...connectors: Array<(el: T) => T>
): Ref<T> {
  return ((el: T | null) => {
    if (el) {
      let result = el;
      for (const connector of connectors) {
        result = connector(result);
      }
    }
  }) as Ref<T>;
}
