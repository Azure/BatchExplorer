
class HmacSha256Sign {
    public async getKey(key: string): Promise<CryptoKey> {
        const base64UrlKey = key.replace(/\//g, "_").replace(/\+/g, "-").replace(/\=/g, "");
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

    public async sign(key: CryptoKey, stringToSign: string) {
        return crypto.subtle.sign("sha256", key, new Buffer(stringToSign));
    }
}

/**
 * @class
 * Creates a new BatchSharedKeyCredentials object.
 * @constructor
 * @param {string} accountName The batch account name.
 * @param {string} accountKey The batch account key.
 */
function BatchSharedKeyCredentials(accountName, accountKey) {
    if (!Boolean(accountName) || typeof accountName.valueOf() !== "string") {
        throw new Error("accountName must be a non empty string.");
    }

    if (!Boolean(accountKey) || typeof accountKey.valueOf() !== "string") {
        throw new Error("accountKey must be a non empty string.");
    }

    this.accountName = accountName;
    this.accountKey = accountKey;
    this.signer = new HmacSha256Sign(accountKey);
}

/**
 * Signs a request with the Authentication header.
 *
 * @param {webResource} The WebResource to be signed.
 * @param {function(error)}  callback  The callback function.
 * @return {undefined}
 */
BatchSharedKeyCredentials.prototype.signRequest = function (webResource, callback) {
    const self = this;

    // Help function to get header value, if header without value, append a newline
    const getvalueToAppend = function (value, headerName) {
        if (!Boolean(value) || !Boolean(value[headerName])) {
            return "\n";
        } else {
            return value[headerName] + "\n";
        }
    };

    // Help function to get content length
    const getContentLengthToAppend = function (value, method, body) {
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
    };

    // Set Headers
    if (!Boolean(webResource.headers["ocp-date"])) {
        webResource.headers["ocp-date"] = new Date().toUTCString();
    }

    // Add verb and standard HTTP header as single line
    let stringToSign = webResource.method + "\n" +
        getvalueToAppend(webResource.headers, "Content-Encoding") +
        getvalueToAppend(webResource.headers, "Content-Language") +
        getContentLengthToAppend(webResource.headers, webResource.method, webResource.body) +
        getvalueToAppend(webResource.headers, "Content-MD5") +
        getvalueToAppend(webResource.headers, "Content-Type") +
        getvalueToAppend(webResource.headers, "Date") +
        getvalueToAppend(webResource.headers, "If-Modified-Since") +
        getvalueToAppend(webResource.headers, "If-Match") +
        getvalueToAppend(webResource.headers, "If-None-Match") +
        getvalueToAppend(webResource.headers, "If-Unmodified-Since") +
        getvalueToAppend(webResource.headers, "Range");

    // Add customize HTTP header
    stringToSign += this._getCanonicalizedHeaders(webResource);

    // Add path/query from uri
    stringToSign += this._getCanonicalizedResource(webResource);

    // Signed with sha256
    const signature = this.signer.sign(stringToSign);

    // Add authrization header
    webResource.headers[Constants.HeaderConstants.AUTHORIZATION] = `SharedKey ${self.accountName}:${signature}`;
    callback(null);
};

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
 * @param {object} The webresource object.
 * @return {string} The canonicalized headers.
 */
BatchSharedKeyCredentials.prototype._getCanonicalizedHeaders = function (webResource) {
    // Build canonicalized headers
    let canonicalizedHeaders = "";
    if (webResource.headers) {
        const canonicalizedHeadersArray = [];

        // Retrieve all headers for begin with ocp-
        for (const header in webResource.headers) {
            if (header.indexOf("ocp-") === 0) {
                canonicalizedHeadersArray.push(header);
            }
        }

        // Sort the header by header name
        canonicalizedHeadersArray.sort();

        _.each(canonicalizedHeadersArray, function (currentHeader) {
            const value = webResource.headers[currentHeader];
            if (Boolean(value)) {
                // Make header value lower case and apend a new line for each header
                canonicalizedHeaders += currentHeader.toLowerCase() + ":" + value + "\n";
            }
        });
    }

    return canonicalizedHeaders;
};

/*
 * Retrieves the webresource's canonicalized resource string.
 * @param {WebResource} webResource The webresource to get the canonicalized resource string from.
 * @return {string} The canonicalized resource string.
 */
BatchSharedKeyCredentials.prototype._getCanonicalizedResource = function (webResource) {
    let path = "/";
    const urlstring = url.parse(webResource.url, true);
    if (urlstring.pathname) {
        path = urlstring.pathname;
    }

    let canonicalizedResource = "/" + this.accountName + path;

    // Get the raw query string values for signing
    const queryStringValues = urlstring.query;

    // Build the canonicalized resource by sorting the values by name.
    if (queryStringValues) {
        let paramNames = [];
        Object.keys(queryStringValues).forEach(function (n) {
            paramNames.push(n);
        });

        // All the queries sorted by query name
        paramNames = paramNames.sort();
        Object.keys(paramNames).forEach(function (name) {
            canonicalizedResource += "\n" + paramNames[name] + ":" + queryStringValues[paramNames[name]];
        });
    }

    return canonicalizedResource;
};
