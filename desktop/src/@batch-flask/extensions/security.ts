import { SanitizedError } from "@batch-flask/utils/error";

const evalBanned = () => {
    throw new SanitizedError("Eval is disabled in BatchExplorer.");
};

// Webpack dev server sourcemap need to use eval
if (process.env.NODE_ENV === "production") {
    if (typeof window !== "undefined") {
        (window as any).eval = evalBanned;
    }

    if (typeof global !== "undefined") {
        global.eval = evalBanned;
    }
}
