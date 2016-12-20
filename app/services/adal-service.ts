import { Injectable } from "@angular/core";
import { Headers, Http, RequestOptions } from "@angular/http";
import { remote } from "electron";

import { SecureUtils } from "app/utils";

const {BrowserWindow} = remote;

const azure = (<any>remote.getCurrentWindow()).azure;

const base = "https://login.microsoftonline.com";
const tenant = "common";
const clientId = "94ef904d-c21a-4672-9946-b4d6a12b8e13";

export interface Config {
    tenant: string;
    clientId: string;
}

export interface AuthorizationResult {
    code: string;
    id_token: string;
    session_state: string;
    state: string;
}

@Injectable()
export class AdalService {
    private config: Config;
    private _authWindow: any = null;

    constructor(private http: Http) {

    }
    public init(config: Config) {
        this.config = config;
    }

    public login(): void {

        const authWindow = this._authWindow = new BrowserWindow({
            width: 800, height: 600, show: false, webPreferences: {
                nodeIntegration: false,
            },
        });
        const url = this._generateAuthUrl();

        authWindow.loadURL(url);
        authWindow.show();
        // authWindow.webContents.openDevTools();

        authWindow.webContents.on("will-navigate", (event, url) => {
            this._handleCallback(url);
        });

        authWindow.webContents.on("did-get-redirect-request", (event, oldUrl, newUrl) => {
            this._handleCallback(newUrl);
        });

        authWindow.on("close", (event) => {
            this._authWindow = null;
        });
    }

    private _generateAuthUrl() {
        // Portal
        // const clientId = "c44b4083-3bb0-49c1-b47d-974e53cbdf3c";
        //Batchlabs

        const params = {
            response_type: "id_token+code",
            redirect_uri: encodeURIComponent("http://localhost"),
            client_id: clientId,
            scope: "user_impersonation+openid",
            nonce: SecureUtils.uuid(),
            state: SecureUtils.uuid(),
            resource: "https://management.core.windows.net/",
        };
        const query = objectToParams(params);
        return `${base}/${tenant}/oauth2/authorize?${query}`;
    }

    private _isRedirectUrl(url: string) {
        return url.match(/http:\/\/localhost\/.*/);
    }

    private _getRedirectUrlParams(url: string): AuthorizationResult {
        const segments = url.split("#");
        const params = {};
        for (let str of segments[1].split("&")) {
            const [key, value] = str.split("=");
            params[key] = value;
        }
        return <AuthorizationResult>params;
    }
    private _handleCallback(url: string) {
        if (!this._isRedirectUrl(url)) {
            return;
        }
        console.log("handle callback", url);
        const params = this._getRedirectUrlParams(url);
        console.log("POarams", params);
        if (this._authWindow) {
            this._authWindow.destroy();
        }
        console.log("user is", new UserDecoder().decode(params.id_token));
        // const credentials = new azure.TokenCloudCredentials({
        //     subscriptionId: "",
        //     token: code,
        // });
        this._redeemToken(params.code);
    }

    private _redeemToken(code: string) {
        const params = {
            grant_type: "authorization_code",
            client_id: clientId,
            code: code,
            resource: "https://management.core.windows.net/",
            redirect_uri: "http://localhost",
        };
        const query = objectToParams(params);
        const url = `${base}/${tenant}/oauth2/token`;
        console.log("Url is ", url);
        const headers = new Headers({"Content-Type": "application/x-www-form-urlencoded"});
        const options = new RequestOptions({headers});
        this.http.post(url, query, options).subscribe({
            next: (out) => { console.log("Output is", out); },
            error: (error) => { console.log("Error for get token is", error); },
        });
    }
}

export function objectToParams(object): string {
    return Object.keys(object).map((key) => {
        return `${encodeURIComponent(key)}=${object[key]}`;
    }).join("&");
}

export interface User {
    aud?: string;
    iss?: string;
    iat?: number;
    nbf?: number;
    exp?: number;
    amr?: string[];
    family_name?: string;
    given_name: string;
    ipaddr: string;
    name: string;
    nonce?: string;
    oid?: string;
    platf?: string;
    sub?: string;
    tid?: string;
    unique_name: string;
    upn?: string;
    ver?: string;
}

declare function escape(v: string): string;

export class UserDecoder {
    public decode(encoded: string): User {

        const jwtDecoded = this.decodeJwt(encoded);
        if (!jwtDecoded) {
            throw Error("Failed to decode value. Value has invalid format.");
        }

        let decodedPayLoad = this.safeDecodeBase64(jwtDecoded.JWSPayload);

        let user = JSON.parse(decodedPayLoad);

        // if (!user || !user.hasOwnProperty('aud')) throw new Error('');

        return <User>user;
    }

    private safeDecodeBase64(value: string) {

        let base64Decoded = this.base64DecodeStringUrlSafe(value);
        if (!base64Decoded) {
            throw Error("Failed to base64 decode value. Value has invalid format.");
        }

        return base64Decoded;
    }

    private decodeJwt(jwtToken: string) {

        const idTokenPartsRegex = /^([^\.\s]*)\.([^\.\s]+)\.([^\.\s]*)$/;

        const matches = idTokenPartsRegex.exec(jwtToken);
        if (!matches || matches.length < 4) {
            throw new Error(`Failed to decode Jwt token. The token has in valid format. Actual token: '${jwtToken}'`);
        }

        const crackedToken = {
            header: matches[1],
            JWSPayload: matches[2],
            JWSSig: matches[3],
        };

        return crackedToken;
    }

    private base64DecodeStringUrlSafe(base64IdToken: string) {
        // html5 should support atob function for decoding
        base64IdToken = base64IdToken.replace(/-/g, "+").replace(/_/g, "/");
        return decodeURIComponent(escape(atob(base64IdToken)));
    }
}
