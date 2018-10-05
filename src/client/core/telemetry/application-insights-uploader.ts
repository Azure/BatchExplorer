import { Injectable } from "@angular/core";
import { ExceptionTelemetry, PageViewTelemetry, Telemetry, TelemetryType, TelemetryUploader } from "@batch-flask/core";
import { SanitizedError, SecureUtils, log } from "@batch-flask/utils";
import * as appinsights from "applicationinsights";
import { ClientConstants } from "client/client-constants";
import { MachineIdService } from "client/core/telemetry/machine-id.service";

const APPLICATION_INSIGHTS_KEY = "a7a73aa4-a7b0-4681-9612-f7191189d5b8";

const APPLICATION_INSIGHTS_TEST_KEY = "0de98d88-0a4e-414a-b08a-de88a2ded108";

@Injectable()
export class ApplicationInsightsUploader implements TelemetryUploader {
    private _client: appinsights.TelemetryClient;

    constructor(private machineIdService: MachineIdService) {

    }
    /**
     * Connect the client. Application will not upload until
     */
    public async init(enabled: boolean) {
        if (!enabled) {
            log.info("Telemetry is disabled. Telemetry service will not start");
            return;
        }

        const key = ClientConstants.isDev ? APPLICATION_INSIGHTS_TEST_KEY : APPLICATION_INSIGHTS_KEY;

        // Init app insights and disable all auto reporting
        appinsights.setup(key)
            .setAutoCollectConsole(false)
            .setAutoCollectExceptions(false)
            .setAutoCollectPerformance(false)
            .setAutoCollectRequests(false)
            .setAutoCollectDependencies(false)
            .setAutoDependencyCorrelation(false)
            .start();
        this._client = appinsights.defaultClient;

        // Prevent application insights from recording the device name
        const context = this._client.context;
        context.tags[context.keys.cloudRoleInstance] = null;

        // Add a session Id
        context.tags[context.keys.sessionId] = SecureUtils.uuid() + Date.now();

        // Add a anoymous user Id to count users
        const machineId = await this.machineIdService.get();
        context.tags[context.keys.userId] = machineId;

    }

    public track(telemetry: Telemetry, type: TelemetryType) {
        if (!this._client) {
            this._logUseTooSoon();
            return;
        }

        if (type === TelemetryType.Exception) {
            const exception = telemetry as ExceptionTelemetry;
            if (exception.exception) {
                exception.exception = this._sanitizeError(exception.exception);
            }
            this._client.trackException(exception);
        } else if (type === TelemetryType.PageView) {
            this.trackPageView(telemetry as PageViewTelemetry);
        } else {
            this._client.track(telemetry, type as any);
        }
    }

    public trackPageView(pageView: PageViewTelemetry) {
        const pageViewData = new appinsights.Contracts.PageViewData();
        pageViewData.name = pageView.name;
        pageViewData.ver = 1;

        const data = new appinsights.Contracts.Data();
        data.baseData = pageView;
        data.baseType = "PageViewData";

        const envelope = new appinsights.Contracts.Envelope();
        envelope.data = data;
        envelope.time = new Date().toISOString();
        envelope.ver = 1;
        envelope.iKey = this._client.config.instrumentationKey;
        envelope.name = "Microsoft.ApplicationInsights.PageView";
        envelope.tags = this._client.context.tags;
        this._client.channel.send(envelope);
    }

    public flush(isAppCrashing?: boolean): Promise<void> {
        if (!this._client) {
            this._logUseTooSoon();
            return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
            return this._client.flush({
                isAppCrashing: isAppCrashing,
                callback: () => resolve(),
            });
        });
    }

    /**
     * This is to get feedback in case some telemtry is trying to be used before service is initialize
     * and knows to enable or not telemetry.
     */
    private _logUseTooSoon() {
        log.error("Trying to trace telemetry before the telemetry service was initialized.");
    }

    private _sanitizeError(error: Error): any {
        // Message could contain user information
        if (!(error instanceof SanitizedError)) {
            error.message = "[sanitized]";
        }
        if (error.stack) {
            error.stack = this._sanitizeStack(error.stack);
        }
        return error;
    }

    private _sanitizeStack(stack: string) {
        const root = ClientConstants.resourcesFolder;
        return stack
            .replace(new RegExp(/file:\/\/.*?\.asar/, "gi"), "[asar]")
            .replace(new RegExp(this._escapeRegExp(root), "gi"), "[install]");
    }

    private _escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }
}
