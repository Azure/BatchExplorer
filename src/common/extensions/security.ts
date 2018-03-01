(window as any).eval = global.eval = () => {
    throw new Error("Eval is disabled in BatchLabs.");
};
