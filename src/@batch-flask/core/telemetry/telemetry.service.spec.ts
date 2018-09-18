import { TelemetryService } from "@batch-flask/core/telemetry/telemetry.service";

describe("TelemetryService", () => {
    let uploader;
    let service: TelemetryService;

    beforeEach(() => {
        uploader = {
            init: jasmine.createSpy("init"),
            trackEvent: jasmine.createSpy("trackEvent"),
            trackMetric: jasmine.createSpy("trackMetric"),
            trackException: jasmine.createSpy("trackException"),
        };

        service = new TelemetryService(uploader);
    });

    describe("before service is initialized", () => {
        it("shoudn't have init the uploader", () => {
            expect(uploader.init).not.toHaveBeenCalled();
        });

        it("shouldn't emit event", () => {
            service.trackEvent({ name: "some-event" });
            expect(uploader.trackEvent).not.toHaveBeenCalled();
        });

        it("shouldn't emit metric", () => {
            service.trackMetric({ name: "some-metric", value: 124 });
            expect(uploader.trackEvent).not.toHaveBeenCalled();
        });

        it("shouldn't emit exceptions", () => {
            service.trackException({ exception: new Error() });
            expect(uploader.trackEvent).not.toHaveBeenCalled();
        });
    });

    describe("when telemetry is disabled", () => {
        beforeEach(async () => {
            await service.init(false);
        });

        it("init the uploader", () => {
            expect(uploader.init).toHaveBeenCalledOnce();
            expect(uploader.init).toHaveBeenCalledWith(false);
        });

        it("shouldn't emit event", () => {
            service.trackEvent({ name: "some-event" });
            expect(uploader.trackEvent).not.toHaveBeenCalled();
        });

        it("shouldn't emit metric", () => {
            service.trackMetric({ name: "some-metric", value: 124 });
            expect(uploader.trackEvent).not.toHaveBeenCalled();
        });

        it("shouldn't emit exceptions", () => {
            service.trackException({ exception: new Error() });
            expect(uploader.trackEvent).not.toHaveBeenCalled();
        });
    });

    describe("when telemetry is enabled", () => {
        beforeEach(async () => {
            await service.init(true);
        });

        it("init the uploader", () => {
            expect(uploader.init).toHaveBeenCalledOnce();
            expect(uploader.init).toHaveBeenCalledWith(true);
        });

        it("emit event", () => {
            service.trackEvent({ name: "some-event" });
            expect(uploader.trackEvent).toHaveBeenCalledOnce();
            expect(uploader.trackEvent).toHaveBeenCalledWith({ name: "some-event" });
        });

        it("emit metric", () => {
            service.trackMetric({ name: "some-metric", value: 124 });
            expect(uploader.trackMetric).toHaveBeenCalledOnce();
            expect(uploader.trackMetric).toHaveBeenCalledWith({ name: "some-metric", value: 124 });
        });

        it("emit exceptions", () => {
            const error = new Error("My error");
            service.trackException({ exception: error });
            expect(uploader.trackException).toHaveBeenCalledOnce();
            expect(uploader.trackException).toHaveBeenCalledWith({ exception: error });
        });
    });
});
