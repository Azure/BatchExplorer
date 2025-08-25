export function delay(time: number = 0) {
    return new Promise(r => setTimeout(r, time));
}

export async function waitFor(fn: () => void, timeout: number = 1000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            fn();
            return;
        } catch (e) {
            await delay(10);
        }
    }
    throw new Error("waitFor timed out");
}
