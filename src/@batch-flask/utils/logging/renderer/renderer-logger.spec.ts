fdescribe("RendererLogger", () => {
    beforeEach(() => {
        spyOn(console, "info");
        spyOn(console, "error");
        spyOn(console, "debug");
        spyOn(console, "warn");
    });
});
