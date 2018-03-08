import {
    ProxyAuthenticationRequiredError, ProxyCredentials, ProxyInvalidCredentialsError, ProxySetting, ProxySettings,
    getProxySettings, validateProxySetting,
} from "get-proxy-settings";
import * as globalTunnel from "global-tunnel-ng";

import { log } from "@batch-flask/utils";
import { BatchLabsApplication } from "client/core";
import { LocalStorage } from "client/core/local-storage";
import { Constants } from "common";
import { BehaviorSubject } from "rxjs";

// @ts-ignore
function allowInsecureRequest() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export class ProxySettingsManager {
    private _settings = new BehaviorSubject(undefined);
    constructor(private batchLabsApp: BatchLabsApplication, private storage: LocalStorage) {
    }

    public async init() {
        await this._loadSettingsFromStorage();
        if (!this._settings.value) {
            try {
                await this._loadProxySettings();
            } catch (e) {
                log.error("Failed to load proxy settings", e);
            }
        }
        this._applyProxySettings(this._settings.value);
    }

    public get settings(): Promise<ProxySettings> {
        return this._settings.filter(x => x !== undefined).take(1).toPromise();
    }

    public async credentials(): Promise<ProxyCredentials> {
        if (this._settings.value) { return this._currentCredentials; }
        await this.settings;
        return this._currentCredentials;
    }

    private async _loadProxySettings() {
        let settings = await getProxySettings();
        settings = await this._validateProxySettings(settings);
        this._settings.next(settings);
        await this._saveProxySettings();
    }

    private async _validateProxySettings(settings: ProxySettings, askForCreds = true) {
        if (!settings) { return null; }
        try {
            await validateProxySetting(settings.http || settings.https);
            return settings;
        } catch (e) {

            if (e instanceof ProxyAuthenticationRequiredError || e instanceof ProxyInvalidCredentialsError) {
                if (askForCreds) {
                    const credentials = await this.batchLabsApp.askUserForProxyCredentials();
                    if (settings.http) {
                        settings.http.credentials = credentials;
                    }
                    if (settings.https) {
                        settings.https.credentials = credentials;
                    }
                    return this._validateProxySettings(settings);
                } else {
                    return null;
                }
            } else {
                throw e;
            }
        }
    }

    private async _loadSettingsFromStorage() {
        try {
            const str = await this.storage.getItem(Constants.localStorageKey.proxySettings);
            if (!str) { return; }
            const { http, https } = JSON.parse(str);
            const settings = {
                http: http && new ProxySetting(http),
                https: https && new ProxySetting(https),
            };
            const valid = await this._validateProxySettings(settings, false);
            if (valid) {
                this._settings.next(settings);
            }
        } catch (e) {
            log.error("Error loading proxy settings. Ignoring", e);
            await this.storage.removeItem(Constants.localStorageKey.proxySettings);
        }
    }

    private async _applyProxySettings(settings: ProxySettings) {
        if (!settings) { return; }
        if (settings.http) {
            process.env.HTTP_PROXY = settings.http.toString();
        }
        if (settings.https) {
            process.env.HTTPS_PROXY = settings.https.toString();
        }
        // Uncomment to debug with fiddler
        // allowInsecureRequest();
        globalTunnel.initialize();
    }

    private async _saveProxySettings() {
        const value = this._settings.value;
        if (!value) { return; }
        const { http, https } = value;
        const str = JSON.stringify({
            http: http && http.toString(),
            https: https && https.toString(),
        });
        await this.storage.setItem(Constants.localStorageKey.proxySettings, str);
    }

    private get _currentCredentials() {
        if (!this._settings.value) { return null; }
        const { http, https } = this._settings.value;

        return https.credentials || http.credentials;
    }
}
