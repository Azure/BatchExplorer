const evalBanned = () => {
    throw new Error("Eval is disabled in BatchLabs.");
};

if (typeof window !== "undefined") {
    (window as any).eval = evalBanned;
}

if (typeof global !== "undefined") {
    global.eval = evalBanned;
}
