import { Injectable } from "@angular/core";
import { Telemetry, TelemetryType, TelemetryUploader } from "@batch-flask/core";
import { ElectronRemote } from "@batch-flask/ui";
import { log } from "@batch-flask/utils";
import { Constants } from "common";

@Injectable()
export class RendererTelemetryUploader implements TelemetryUploader {
    private _enabled = false;
    private _initialized = false;

    constructor(private remote: ElectronRemote) {

    }
    public init(enabled: boolean) {
        this._enabled = enabled;
        this._initialized = true;
    }

    public track(telemetry: Telemetry, type: TelemetryType) {
        console.log("track here", telemetry, type, this._enabled, this._initialized);
        if (!this._enabled) { return; }

        if (!this._initialized) {
            log.error("Trying to send telemetry before initialized");
        }
        this.remote.send(Constants.IpcEvent.sendTelemetry, { telemetry, type });
    }

    public async flush(isAppCrashing?: boolean): Promise<void> {
        // TODO
        return null;
    }

}
