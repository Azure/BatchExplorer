import { Inject, Injectable, InjectionToken } from "@angular/core";
import { EventTelemetry, ExceptionTelemetry, MetricTelemetry } from "./telemetry.model";

export interface TelemetryUploader {
    init(enabled: boolean);

    trackException(exception: ExceptionTelemetry);
    trackEvent(event: EventTelemetry);
    trackMetric(event: MetricTelemetry);

    flush(isAppCrashing?: boolean): Promise<void>;
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

    /**
     *
     * @param isAppCrashing If the app is about to crash and will close before flushing is done.
     * This make sure the data is saved to disk and will be uploaded on next opening
     */
    public flush(isAppCrashing?: boolean): Promise<void> {
        return this._uploader.flush(isAppCrashing);
    }
}
