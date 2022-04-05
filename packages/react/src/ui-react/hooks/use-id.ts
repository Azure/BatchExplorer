import * as React from "react";
import { uniqueId } from "@batch/ui-common";

/**
 * Hook which generates a unique ID string which is stable across
 * re-renders.
 *
 * @param prefix Optional prefix to make the ID more readable
 * @param providedId Optional ID to use instead of generating a new one.
 *
 * @returns A unique ID string
 */
export function useUniqueId(prefix?: string, providedId?: string) {
    const ref = React.useRef<string | undefined>(providedId);
    if (!ref.current) {
        ref.current = uniqueId(prefix);
    }
    return ref.current;
}
