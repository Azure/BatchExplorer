import { HttpHeaders, HttpParams } from "@angular/common/http";
import { HttpRequestOptions } from "@batch-flask/core";
import { UrlUtils } from "@batch-flask/utils";
import * as url from "url";

class HmacSha256Sign {
    private _importKeyPromise: Promise<CryptoKey>;
    constructor(public key: string) {
        this._importKeyPromise = this._importKey();
    }

    public async sign(stringToSign: any) {
        const key = await this._importKeyPromise;
        return crypto.subtle.sign(({ name: "hmac", hash: { name: "sha-256" } }), key, new Buffer(stringToSign));
    }

    private async _importKey(): Promise<CryptoKey> {
        const base64UrlKey = this.key.replace(/\//g, "_").replace(/\+/g, "-").replace(/\=/g, "");
        const hmckKeyObject = {
            kty: "oct",
            alg: "HS256",
            k: base64UrlKey,
            extractable: false,
        };
        return crypto.subtle.importKey("jwk",
            hmckKeyObject,
            { name: "hmac", hash: { name: "sha-256" } },
            false,
            ["sign"]);
    }
}

function getvalueToAppend(headers: HttpHeaders, name: string) {
    if (headers.has(name)) {
        return `${headers.get(name)}\n`;
    } else {
        return "\n";
    }
}

function getContentLengthToAppend(value, method: string, body: string) {
    if (!Boolean(value) || !Boolean(value["Content-Length"])) {
        // Get content length from body if available
        if (body) {
            return Buffer.byteLength(body) + "\n";
        }
        // For GET verb, do not add content-length
        if (method === "GET") {
            return "\n";
        } else {
            return "0\n";
        }
    } else {
        return value["Content-Length"] + "\n";
    }
}

export class BatchSharedKeyAuthenticator {
    public signer: HmacSha256Sign;

    constructor(public name: string, public key: string) {
        this.signer = new HmacSha256Sign(key);
    }

    public async signRequest(method: string, uri: string, request: HttpRequestOptions) {
        let headers = request.headers instanceof HttpHeaders ? request.headers : new HttpHeaders(request.headers);
        // Set Headers
        if (!headers.has("ocp-date")) {
            headers = headers.set("ocp-date", new Date().toUTCString());
        }
        let stringToSign = method + "\n" +
            getvalueToAppend(headers, "Content-Encoding") +
            getvalueToAppend(headers, "Content-Language") +
            getContentLengthToAppend(headers, method, request.body) +
            getvalueToAppend(headers, "Content-MD5") +
            getvalueToAppend(headers, "Content-Type") +
            getvalueToAppend(headers, "Date") +
            getvalueToAppend(headers, "If-Modified-Since") +
            getvalueToAppend(headers, "If-Match") +
            getvalueToAppend(headers, "If-None-Match") +
            getvalueToAppend(headers, "If-Unmodified-Since") +
            getvalueToAppend(headers, "Range");

        // Add customize HTTP header
        stringToSign += this._getCanonicalizedHeaders(headers);

        // Add path/query from uri
        stringToSign += this._getCanonicalizedResource(uri, request);

        // Signed with sha256
        const encoder = new TextEncoder();
        const buffer = await this.signer.sign(encoder.encode(stringToSign));
        const signature = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
        // Add authrization header
        headers = headers.set("Authorization", `SharedKey ${this.name}:${signature}`);

        request.headers = headers;
    }

    /*
     * Constructs the Canonicalized Headers string.
     *
     * To construct the CanonicalizedHeaders portion of the signature string,
     * follow these steps: 1. Retrieve all headers for the resource that begin
     * with ocp-, including the ocp-date header. 2. Convert each HTTP header
     * name to lowercase. 3. Sort the headers lexicographically by header name,
     * in ascending order. Each header may appear only once in the
     * string. 4. Unfold the string by replacing any breaking white space with a
     * single space. 5. Trim any white space around the colon in the header. 6.
     * Finally, append a new line character to each canonicalized header in the
     * resulting list. Construct the CanonicalizedHeaders string by
     * concatenating all headers in this list into a single string.
     *
     * @param {HttpHeaders} The headers object.
     * @return {string} The canonicalized headers.
     */
    private _getCanonicalizedHeaders(headers: HttpHeaders) {
        if (!headers) { return ""; }

        let canonicalizedHeaders = "";
        const canonicalizedHeadersArray = [];

        // Retrieve all headers for begin with ocp-
        for (const header of headers.keys()) {
            if (header.includes("ocp-")) {
                canonicalizedHeadersArray.push(header);
            }
        }

        // Sort the header by header name
        canonicalizedHeadersArray.sort();

        for (const header of canonicalizedHeadersArray) {
            const value = headers.get(header);
            if (value) {
                // Make header value lower case and apend a new line for each header
                canonicalizedHeaders += header.toLowerCase() + ":" + value + "\n";
            }
        }
        return canonicalizedHeaders;
    }

    private _getCanonicalizedResource(uri: string, request: HttpRequestOptions) {
        let path = uri;

        // Get the raw query string values for signing
        let params = request.params instanceof HttpParams
            ? request.params
            : new HttpParams({ fromObject: request.params });

        if (UrlUtils.isHttpUrl(uri)) {
            const urlstring = url.parse(uri, true);
            if (urlstring.pathname) {
                path = urlstring.pathname;
            } else {
                path = "/";
            }
            for (const param of Object.keys(urlstring.query)) {
                params = params.set(param, urlstring.query[param] as string);
            }
        }

        let canonicalizedResource = "/" + this.name + path;

        // Build the canonicalized resource by sorting the values by name.
        const paramNames = params.keys().sort();

        for (const name of paramNames) {
            canonicalizedResource += "\n" + name + ":" + params.get(name);
        }

        return canonicalizedResource;
    }
}
