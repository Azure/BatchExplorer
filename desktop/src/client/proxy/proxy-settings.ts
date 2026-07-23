import { Inject, Injectable, forwardRef } from "@angular/core";
import { DataStore } from "@batch-flask/core";
import { log } from "@batch-flask/utils";
import { BatchExplorerApplication } from "client/core/batch-explorer-application";
import { BatchExplorerProcess } from "client/core/batch-explorer-process";
import { Constants } from "common";
import {
    ProxyCredentials, ProxySetting, ProxySettings,
} from "get-proxy-settings";
import { BehaviorSubject } from "rxjs";
import { map, take } from "rxjs/operators";

export interface ProxySettingConfiguration {
    settings: ProxySettings | null;
    credentials: ProxyCredentials | null;
}

@Injectable()
export class ProxySettingsManager {
    private _settings = new BehaviorSubject<ProxySettingConfiguration | null>(null);
    private batchExplorerApp: BatchExplorerApplication;
    constructor(
        // NOTE: `batchExplorerApp` is typed `any` (not BatchExplorerApplication) on purpose.
        // BatchExplorerApplication <-> ProxySettingsManager form a circular dependency. The
        // DI token is supplied via `forwardRef` (lazy), but with `emitDecoratorMetadata` a
        // `BatchExplorerApplication` param type would also be emitted eagerly in
        // `design:paramtypes`, which throws a TDZ ReferenceError once the code is bundled by
        // webpack. Keeping the param untyped avoids that eager reference; the typed private
        // field below preserves type-safety for internal usage.
        @Inject(forwardRef(() => BatchExplorerApplication)) batchExplorerApp: any,
        private batchExplorerProcess: BatchExplorerProcess,
        private storage: DataStore) {
        this.batchExplorerApp = batchExplorerApp;
    }

    public async init() {
        await this._loadSettingsFromStorage();
    }

    public get settings(): Promise<ProxySettings | null> {
        return this._settings.pipe(
            take(1),
            map(x => x?.settings),
        ).toPromise();
    }

    public async configureManualy(): Promise<ProxySettings | null> {
        const config = this._settings.value;
        const settings = await this.batchExplorerApp.askUserForProxyConfiguration(config && config.settings);
        this._settings.next({
            settings,
            credentials: null,
        });
        await this._saveProxySettings();
        this.batchExplorerProcess.restart();
        return settings;
    }

    public async credentials(): Promise<ProxyCredentials> {
        const current = this._currentCredentials;
        if (current) { return current; }
        const credentials = await this.batchExplorerApp.askUserForProxyCredentials();

        this._settings.next({
            settings: this._settings.value && this._settings.value.settings,
            credentials: credentials,
        });
        await this._saveProxySettings();
        return credentials;
    }

    private async _loadSettingsFromStorage() {
        try {
            const str = await this.storage.getItem(Constants.localStorageKey.proxySettings);
            if (!str) { return; }
            const { http, https, credentials } = JSON.parse(str);
            const settings = {
                http: http && new ProxySetting(http),
                https: https && new ProxySetting(https),
            };
            log.info("Loaded proxy settings", {
                http: settings.http && this._safePrintProxySetting(settings.http),
                https: settings.http && this._safePrintProxySetting(settings.https),
            });
            this._settings.next({
                settings,
                credentials,
            });
        } catch (e) {
            log.error("Error loading proxy settings. Ignoring", e);
            await this.storage.removeItem(Constants.localStorageKey.proxySettings);
        }
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
        if (!value.settings && !value.credentials) {
            await this.storage.removeItem(Constants.localStorageKey.proxySettings);
        } else {
            const http = value.settings && value.settings.http;
            const https = value.settings && value.settings.https;
            const str = JSON.stringify({
                http: http && http.toString(),
                https: https && https.toString(),
                credentials: value.credentials,
            });
            await this.storage.setItem(Constants.localStorageKey.proxySettings, str);
        }
    }

    private get _currentCredentials() {
        if (!this._settings.value) { return null; }
        const value = this._settings.value;
        const { settings } = value;

        return value.credentials
            || (settings && settings.https && settings.https.credentials)
            || (settings && settings.http && settings.http.credentials);
    }
}
