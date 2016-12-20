import { Injectable } from "@angular/core";
import { Headers, Http, RequestOptions } from "@angular/http";
import { remote } from "electron";

import { SecureUtils } from "app/utils";
import { AuthorizeResult, UserAuthorization } from "./user-authorization";
import { UserDecoder } from "./user-decoder";

const {BrowserWindow} = remote;

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
    private _config: Config;
    private _authWindow: any = null;
    private _authorizeUser: UserAuthorization;

    constructor(private http: Http) {

    }
    public init(config: Config) {
        this._config = config;
        this._authorizeUser = new UserAuthorization(config);
    }

    public login(): void {
        this._authorizeUser.authorizeTrySilentFirst().subscribe({
            next: (result: AuthorizeResult) => {
                console.log("Got result", result);
            },
            error: (error) => {
                console.error("Error auth", error);
            },
        });
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
        const headers = new Headers({ "Content-Type": "application/x-www-form-urlencoded" });
        const options = new RequestOptions({ headers });
        this.http.post(url, query, options).subscribe({
            next: (out) => {
                console.log("Output is", out, out.json());
                this._listSub(out.json().access_token);
            },
            error: (error) => { console.log("Error for get token is", error); },
        });
    }

    private _listSub(token: string) {
        const url = `https://management.azure.com/subscriptions?api-version=2016-06-01`;
        const headers = new Headers({ "Authorization": `Bearer ${token}` });
        const options = new RequestOptions({ headers });
        this.http.get(url, options).subscribe({
            next: (out) => {
                console.log("Subs are", out.json());
            },
            error: (error) => { console.log("Error for get sub is", error); },
        });
    }
}

export function objectToParams(object): string {
    return Object.keys(object).map((key) => {
        return `${encodeURIComponent(key)}=${object[key]}`;
    }).join("&");
}
