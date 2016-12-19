import { Injectable } from "@angular/core";
import { remote } from "electron";

import { SecureUtils } from "app/utils";

const {BrowserWindow} = remote;

export interface Config {
    tenant: string;
    clientId: string;
}

export interface OAuthData {
    isAuthenticated: boolean;
    userName: string;
    loginError: string;
    profile: any;
}

@Injectable()
export class AdalService {
    private config: Config;
    private _authWindow: any = null;

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
        const base = "https://login.microsoftonline.com";
        const tenant = "microsoft.onmicrosoft.com";
        const clientId = "9d77ff61-52a4-4e96-a128-44f67265affd";
        const params = {
            response_type: "id_token",
            redirect_uri: "http://localhost",
            client_id: clientId,
            nonce: SecureUtils.uuid(),
            state: SecureUtils.uuid(),
        };
        const query = objectToParams(params);

        return `${base}/${tenant}/oauth2/authorize?${query}`;
    }

    private _handleCallback(url: string) {
        const pattern = /http:\/\/localhost\/#id_token=([^&]*)/;
        const match = pattern.exec(url) || null;
        const code = (match && match.length > 1) ? match[1] : null;
        if (this._authWindow) {
            this._authWindow.destroy();
        }
        console.log("Tokem is", code);
        console.log("user is", new UserDecoder().decode(code));
    }
}

export function objectToParams(object): string {
    return Object.keys(object).map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`;
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
