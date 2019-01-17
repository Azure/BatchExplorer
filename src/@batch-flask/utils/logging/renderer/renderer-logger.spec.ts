import { RendererLogger } from "./renderer-logger";

// tslint:disable:no-console

describe("RendererLogger", () => {
    let logger: RendererLogger;
    let ipcMainSendSpy: jasmine.Spy;

    beforeEach(() => {
        ipcMainSendSpy = jasmine.createSpy("ipcMain.send");

        spyOn(console, "info");
        spyOn(console, "error");
        spyOn(console, "debug");
        spyOn(console, "warn");
        logger = new RendererLogger({
            send: ipcMainSendSpy,
        } as any);
    });

    it("calls console.info and send event when calling logger.", () => {
        logger.info("Foo", "Bar", { val: 3 });

        expect(console.info).toHaveBeenCalledOnce();
        expect(console.info).toHaveBeenCalledWith("Foo", "Bar", { val: 3 });

        expect(console.error).not.toHaveBeenCalled();
        expect(console.warn).not.toHaveBeenCalled();
        expect(console.debug).not.toHaveBeenCalled();

        expect(ipcMainSendSpy).toHaveBeenCalledWith("SEND_LOG", {
            level: "info",
            message: "Foo", params: ["Bar", { val: 3 }],
        });
    });

    it("calls console.debug and send event when calling logger.", () => {
        logger.debug("Foo", "Bar", { val: 3 });

        expect(console.debug).toHaveBeenCalledOnce();
        expect(console.debug).toHaveBeenCalledWith("Foo", "Bar", { val: 3 });

        expect(console.info).not.toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();
        expect(console.warn).not.toHaveBeenCalled();

        expect(ipcMainSendSpy).toHaveBeenCalledWith("SEND_LOG", {
            level: "debug",
            message: "Foo", params: ["Bar", { val: 3 }],
        });
    });

    it("calls console.error and send event when calling logger.", () => {
        const error = new Error("Some error");
        logger.error("Foo", error);

        expect(console.error).toHaveBeenCalledOnce();
        expect(console.error).toHaveBeenCalledWith("Foo", error);

        expect(console.info).not.toHaveBeenCalled();
        expect(console.debug).not.toHaveBeenCalled();
        expect(console.warn).not.toHaveBeenCalled();

        expect(ipcMainSendSpy).toHaveBeenCalledWith("SEND_LOG", {
            level: "error",
            message: "Foo", params: [error],
        });
    });

    it("calls console.warn and send event when calling logger.", () => {
        logger.warn("Foo", "Bar", { val: 3 });

        expect(console.warn).toHaveBeenCalledOnce();
        expect(console.warn).toHaveBeenCalledWith("Foo", "Bar", { val: 3 });

        expect(console.info).not.toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();
        expect(console.debug).not.toHaveBeenCalled();

        expect(ipcMainSendSpy).toHaveBeenCalledWith("SEND_LOG", {
            level: "warn",
            message: "Foo", params: ["Bar", { val: 3 }],
        });
    });
});
