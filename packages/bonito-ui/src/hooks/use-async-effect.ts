import { DependencyList, useEffect } from "react";

export type AsyncEffectCallback = () => Promise<void | (() => void)>;

/**
 * A hook which is functionally the same as useEffect(), but accepts a callback
 * which returns a promise. This is particularly helpful when using async/await
 * because the async keyword automatically makes a function return a promise.
 *
 * Note that if you need a cleanup function you can use useEffect instead and
 * simply do not return your async function's promise.
 *
 * @example
 * ```typescript
 * // Before
 * useEffect(() => {
 *     const doFetch = async () => {
 *         await fetch("https://contoso.net");
 *     };
 *     doFetch();
 * }, [])
 *
 * // After
 * useAsyncEffect(async () => {
 *     await fetch("https://contoso.net");
 * }, []);
 * ```
 *
 * @param effect Async function that can return a cleanup function
 * @param deps If present, effect will only activate if the values in the list change.
 */
export function useAsyncEffect(
    effect: AsyncEffectCallback,
    deps?: DependencyList
): void {
    useEffect(
        () => {
            const ret = effect();

            // If the returned value is not an async function, just treat it
            // like useEffect
            if (typeof ret === "function") {
                return ret;
            }

            ret.then((cleanup) => {
                if (cleanup) {
                    cleanup();
                }
            });
            return;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        deps
    );
}
