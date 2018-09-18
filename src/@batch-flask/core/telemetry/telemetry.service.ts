import { Inject, Injectable, InjectionToken } from "@angular/core";
import { EventTelemetry, ExceptionTelemetry, MetricTelemetry } from "./telemetry.model";

export interface TelemetryUploader {
    init(enabled: boolean);

    trackException(exception: ExceptionTelemetry);
    trackEvent(event: EventTelemetry);
    trackMetric(event: MetricTelemetry);

    flush();
}

export const TELEMETRY_UPLOADER = new InjectionToken("TELEMETRY_UPLOADER");

@Injectable()
export class TelemetryService {

    private _enable = false;

    constructor(@Inject(TELEMETRY_UPLOADER) private _uploader: TelemetryUploader) { }

    public init(enabled: boolean) {
        this._enable = enabled;
        this._uploader.init(enabled);
    }

    public trackError(error: Error) {
        if (!this._enable) { return; }
        this._uploader.trackException({ exception: error });
    }

    public trackException(exception: ExceptionTelemetry) {
        if (!this._enable) { return; }
        this._uploader.trackException(exception);
    }

    public trackEvent(event: EventTelemetry) {
        if (!this._enable) { return; }
        this._uploader.trackEvent(event);
    }

    public trackMetric(event: MetricTelemetry) {
        if (!this._enable) { return; }
        this._uploader.trackMetric(event);
    }

    public flush() {
        this._uploader.flush();
    }
}
