import { Injectable } from "@angular/core";
import { EventTelemetry, ExceptionTelemetry, MetricTelemetry, TelemetryUploader } from "@batch-flask/core";
import * as appinsights from "applicationinsights";

@Injectable()
export class ApplicationInsightsUploader implements TelemetryUploader {
    private _client: appinsights.TelemetryClient;

    constructor() {
        appinsights.setup("a7a73aa4-a7b0-4681-9612-f7191189d5b8").start();
        this._client = appinsights.defaultClient;
    }

    public trackException(exception: ExceptionTelemetry) {
        this._client.trackException(exception);
    }

    public trackEvent(event: EventTelemetry) {
        this._client.trackEvent(event);
    }

    public trackMetric(event: MetricTelemetry) {
        this._client.trackMetric(event);
    }
}
