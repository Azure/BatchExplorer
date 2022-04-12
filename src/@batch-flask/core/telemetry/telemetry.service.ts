import { Inject, Injectable, InjectionToken } from "@angular/core";
import { Telemetry } from "applicationinsights/out/Declarations/Contracts";
import {
    EventTelemetry, ExceptionTelemetry, MetricTelemetry, PageViewTelemetry, TelemetryType,
} from "./telemetry.model";

export interface TelemetryUploader {
    init(enabled: boolean);

    track(telemetry: Telemetry, type: TelemetryType);

    flush(isAppCrashing?: boolean): Promise<void>;
}

export const TELEMETRY_UPLOADER = new InjectionToken("TELEMETRY_UPLOADER");

@Injectable({providedIn: "root"})
export class TelemetryService {

    private _enable = false;

    constructor(@Inject(TELEMETRY_UPLOADER) private _uploader: TelemetryUploader) { }

    public async init(enabled: boolean) {
        this._enable = enabled;
        await this._uploader.init(enabled);
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    public trackError(error: Error) {
        this.trackException({ exception: error });
    }

    public trackException(exception: ExceptionTelemetry) {
        this.track(exception, TelemetryType.Exception);
    }

    public trackEvent(event: EventTelemetry) {
        this.track(event, TelemetryType.Event);
    }

    public trackMetric(metric: MetricTelemetry) {
        this.track(metric, TelemetryType.Metric);
    }

    public trackPageView(pageView: PageViewTelemetry) {
        this.track(pageView, TelemetryType.PageView);
    }

    /**
     * Used to track if a setting is being used
     *
     * **ONLY** use for non personal data(No user path)
     *
     * @param name Name of the setting
     * @param value Value used
     */
    public trackSetting(name: string, value: string) {
        this.trackEvent({
            name: "Setting used",
            properties: {
                name,
                value,
            },
        });
    }

    public track(telemetry: Telemetry, type: TelemetryType) {
        if (!this._enable) { return; }
        this._uploader.track(telemetry, type);
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
