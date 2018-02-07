import { BatchLabsApplication } from "client/core";
import { ProxyCredentials, ProxySettings, getAndTestProxySettings } from "get-proxy-settings";

export class ProxySettingsManager {
    private _settings: ProxySettings;
    private _credentials: ProxyCredentials;
    constructor(private batchLabsApp: BatchLabsApplication) {

    }

    public init() {
        this._loadSettingsFromStorage();
    }

    public async settings(): Promise<ProxySettings> {
        if (this._settings) { return this._settings; }

        this._settings = await this._loadProxySettings();
    }

    public async credentials(): Promise<ProxyCredentials> {
        if (this._settings) { return this._credentials; }
        await this.settings();
        return this._credentials;
    }

    private async _loadProxySettings() {
        return getAndTestProxySettings(async () => {
            this._credentials = await this.batchLabsApp.askUserForProxyCredentials();
            return this._credentials;
        });
    }

    private _loadSettingsFromStorage() {
        // TODO
    }
}
