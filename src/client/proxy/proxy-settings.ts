import {
    ProxyAuthenticationRequiredError, ProxyCredentials, ProxyInvalidCredentialsError, ProxySetting, ProxySettings,
    getProxySettings, validateProxySetting,
} from "get-proxy-settings";

import { Inject, Injectable, forwardRef } from "@angular/core";
import { log } from "@batch-flask/utils";
import { BatchLabsApplication } from "client/core/batchlabs-application";
import { LocalStorage } from "client/core/local-storage";
import { Constants } from "common";
import { BehaviorSubject } from "rxjs";
import { filter, map, take } from "rxjs/operators";

export interface ProxySettingConfiguration {
    settings: ProxySettings;
    manual: boolean;
}

// @ts-ignore
function allowInsecureRequest() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

@Injectable()
export class ProxySettingsManager {
    private _settings = new BehaviorSubject<ProxySettingConfiguration>(undefined);
    constructor(
        @Inject(forwardRef(() => BatchLabsApplication)) private batchLabsApp: BatchLabsApplication,
        private storage: LocalStorage) {
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

        if (this._settings.value) {
            this._applyProxySettings(this._settings.value.settings);
        }
    }

    public get settings(): Promise<ProxySettings> {
        return this._settings.pipe(
            filter(x => x !== undefined),
            take(1),
            map(x => x.settings),
        ).toPromise();
    }

    public async configureManualy(): Promise<ProxySettings> {
        const config = this._settings.value;
        const settings = await this.batchLabsApp.askUserForProxyConfiguration(config && config.settings);
        this._settings.next({
            settings,
            manual: true,
        });
        await this._saveProxySettings();
        this.batchLabsApp.restart();
        return settings;
    }

    public async credentials(): Promise<ProxyCredentials> {
        if (this._settings.value) { return this._currentCredentials; }
        await this.settings;
        return this._currentCredentials;
    }

    private async _loadProxySettings() {
        let settings = await getProxySettings();
        settings = await this._validateProxySettings(settings);
        this._settings.next({
            settings,
            manual: false,
        });
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
            const { http, https, manual } = JSON.parse(str);
            const settings = {
                http: http && new ProxySetting(http),
                https: https && new ProxySetting(https),
            };
            log.debug("Loaded proxy settings", {
                manual,
                http: this._safePrintProxySetting(settings.http),
                https: this._safePrintProxySetting(settings.https),
            });
            let valid = true;
            if (!manual) {
                valid = await this._validateProxySettings(settings, false);
            }
            if (valid) {
                this._settings.next({
                    settings,
                    manual,
                });
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
            log.info("Setting HTTP proxy settings", this._safePrintProxySetting(settings.http));
        }
        if (settings.https) {
            process.env.HTTPS_PROXY = settings.https.toString();
            log.info("Setting HTTPS proxy settings", this._safePrintProxySetting(settings.https));
        }
        // allowInsecureRequest();
    }

    private _safePrintProxySetting(setting: ProxySetting) {
        if (setting.credentials) {
            return `${setting.protocol}://xxxx:yyyyy@${setting.host}:${setting.port}`;
        } else {
            return `${setting.protocol}://${setting.host}:${setting.port}`;
        }
    }

    private async _saveProxySettings() {
        const value = this._settings.value;
        if (!value) { return; }
        if (!value.settings) {
            if (value.manual) {
                const str = JSON.stringify({
                    http: null,
                    https: null,
                    manual: value.manual,
                });
                await this.storage.setItem(Constants.localStorageKey.proxySettings, str);
            } else {
                await this.storage.removeItem(Constants.localStorageKey.proxySettings);
            }
        } else {
            const { http, https } = value.settings;
            const str = JSON.stringify({
                http: http && http.toString(),
                https: https && https.toString(),
                manual: value.manual,
            });
            await this.storage.setItem(Constants.localStorageKey.proxySettings, str);
        }
    }

    private get _currentCredentials() {
        if (!this._settings.value) { return null; }
        const { settings } = this._settings.value;

        return settings.https.credentials || settings.http.credentials;
    }
}
