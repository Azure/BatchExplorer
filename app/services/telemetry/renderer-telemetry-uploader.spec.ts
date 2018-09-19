import { EventTelemetry, TelemetryType } from "@batch-flask/core";
import { ExceptionTelemetry } from "applicationinsights/out/Declarations/Contracts";
import { Constants } from "common";
import { RendererTelemetryUploader } from "./renderer-telemetry-uploader";

describe("RendererTelemetryUploader", () => {
    let uploader: RendererTelemetryUploader;
    let remoteSpy;

    beforeEach(() => {
        remoteSpy = {
            send: jasmine.createSpy("remote.send"),
        };
        uploader = new RendererTelemetryUploader(remoteSpy);
    });

    describe("uploaded is not initalized yet", () => {
        it("shouldn't send any event", () => {
            uploader.track({
                name: "My event",
                properties: {
                    foo: "bar",
                },
            } as EventTelemetry, TelemetryType.Event);

            expect(remoteSpy.send).not.toHaveBeenCalled();
        });
    });

    describe("when telemetry is disabled", () => {
        it("shouldn't send any event", () => {
            uploader.init(false);
            uploader.track({
                name: "My event",
                properties: {
                    foo: "bar",
                },
            } as EventTelemetry, TelemetryType.Event);

            expect(remoteSpy.send).not.toHaveBeenCalled();
        });
    });

    describe("when telemetry is enabled", () => {
        it("Send event to client", () => {
            uploader.init(true);
            uploader.track({
                name: "My event",
                properties: {
                    foo: "bar",
                },
            } as EventTelemetry, TelemetryType.Event);

            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(remoteSpy.send).toHaveBeenCalledWith(Constants.IpcEvent.sendTelemetry, {
                telemetry: {
                    name: "My event",
                    properties: {
                        foo: "bar",
                    },
                },
                type: TelemetryType.Event,
            });
        });

        it("Send serialized exception to client", () => {
            uploader.init(true);
            const error = new Error("My error");
            error.stack = "some-tack.js";
            uploader.track({
                exception: error,
            } as ExceptionTelemetry, TelemetryType.Exception);

            expect(remoteSpy.send).toHaveBeenCalledOnce();
            expect(remoteSpy.send).toHaveBeenCalledWith(Constants.IpcEvent.sendTelemetry, {
                telemetry: {
                    exception: {
                        message: error.message,
                        name: error.name,
                        stack: error.stack,
                    },
                },
                type: TelemetryType.Exception,
            });
        });
    });
});
