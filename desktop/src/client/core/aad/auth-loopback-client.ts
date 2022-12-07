import { log } from "@batch-flask/utils";
import { IncomingMessage, Server, ServerResponse, createServer } from "http";
import { ILoopbackClient, ServerAuthorizationCodeResponse } from "@azure/msal-node";
import type { AddressInfo } from "net";

/**
 * Listen for an auth code response on the loopback address. Will use a preferred
 * port if available, but fall back to a random port if not.
 */
export class AuthLoopbackClient implements ILoopbackClient {
    port: number = 0; // default port, which will be set to a random available port
    private server: Server;

    private constructor(port: number = 0) {
        this.port = port;
    }

    /**
     * Initializes a loopback server with an available port
     * @param preferredPort
     * @param logger
     * @returns
     */
    static async initialize(preferredPort: number | undefined): Promise<AuthLoopbackClient> {
        const loopbackClient = new AuthLoopbackClient();

        if (preferredPort === 0 || preferredPort === undefined) {
            return loopbackClient;
        }
        const isPortAvailable = await loopbackClient.isPortAvailable(preferredPort);

        if (isPortAvailable) {
            loopbackClient.port = preferredPort;
        }

        return loopbackClient;
    }

    /**
     * Spins up a loopback server which returns the server response when the localhost redirectUri is hit
     * @param successTemplate
     * @param errorTemplate
     * @returns
     */
    async listenForAuthCode(successTemplate?: string, errorTemplate?: string): Promise<ServerAuthorizationCodeResponse> {
        if (!!this.server) {
            throw new Error('Auth code listener already exists. Cannot create another.');
        }

        const authCodeListener = new Promise<ServerAuthorizationCodeResponse>((resolve, reject) => {
            this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
                const url = req.url;
                if (!url) {
                    res.end(errorTemplate || "Login failed: Error occurred loading redirectUrl");
                    reject(new Error('Auth code listener callback was invoked without a url.'));
                    return;
                } else if (url === "/") {
                    res.end(successTemplate || "Successfully logged in to Batch Explorer. You may close this window.");
                    return;
                }

                const authCodeResponse = AuthLoopbackClient.getDeserializedQueryString(url);
                if (authCodeResponse.code) {
                    const redirectUri = await this.getRedirectUri();
                    res.writeHead(302, { location: redirectUri }); // Prevent auth code from being saved in the browser history
                    res.end();
                }
                resolve(authCodeResponse);
            });
            this.server.listen(this.port);
            log.debug(`Initialized auth code listener on port ${this.port}`);
        });

        // Wait for server to be listening
        await new Promise<void>((resolve) => {
            let ticks = 0;
            const id = setInterval(() => {
                if ((5000 / 100) < ticks) {
                    throw new Error('Timed out waiting for auth code listener to be registered.');
                }

                if (this.server.listening) {
                    clearInterval(id);
                    resolve();
                }
                ticks++;
            }, 100);
        });

        return authCodeListener;
    }

    /**
     * Get the port that the loopback server is running on
     * @returns
     */
    getRedirectUri(): string {
        if (!this.server) {
            throw new Error('No auth code listener exists yet.');
        }

        const addressInfo = this.server.address();
        if (addressInfo == null || typeof addressInfo === "string") {
            this.closeServer();
            throw new Error("Failed to read auth code listener port");
        }

        return `http://localhost:${addressInfo.port}`;
    }

    /**
     * Close the loopback server
     */
    closeServer(): void {
        if (!!this.server) {
            this.server.close();
        }
    }

    /**
     * Attempts to create a server and listen on a given port
     * @param port
     * @returns
     */
    isPortAvailable(port: number): Promise<boolean> {
        return new Promise(resolve => {
            const server = createServer()
                .listen(port, () => {
                    server.close();
                    resolve(true);
                })
                .on("error", () => {
                    resolve(false);
                });
        });
    }

    /**
     * Returns URL query string as server auth code response object.
     */
    static getDeserializedQueryString(
        query: string
    ): ServerAuthorizationCodeResponse {
        // Check if given query is empty
        if (!query) {
            return {};
        }
        // Strip the ? symbol if present
        const parsedQueryString = this.parseQueryString(query);
        // If ? symbol was not present, above will return empty string, so give original query value
        const deserializedQueryString: ServerAuthorizationCodeResponse =
            this.queryStringToObject(
                parsedQueryString || query
            );
        // Check if deserialization didn't work
        if (!deserializedQueryString) {
            throw "Unable to deserialize query string";
        }
        return deserializedQueryString;
    }

    /**
     * Parses query string from given string. Returns empty string if no query symbol is found.
     * @param queryString
     */
    static parseQueryString(queryString: string): string {
        const queryIndex1 = queryString.indexOf("?");
        const queryIndex2 = queryString.indexOf("/?");
        if (queryIndex2 > -1) {
            return queryString.substring(queryIndex2 + 2);
        } else if (queryIndex1 > -1) {
            return queryString.substring(queryIndex1 + 1);
        }
        return "";
    }

    /**
     * Parses string into an object.
     *
     * @param query
     */
    static queryStringToObject(query: string): ServerAuthorizationCodeResponse {
        const obj: {[key:string]:string} = {};
        const params = query.split("&");
        const decode = (s: string) => decodeURIComponent(s.replace(/\+/g, " "));
        params.forEach((pair) => {
            if (pair.trim()) {
                const [key, value] = pair.split(/=(.+)/g, 2); // Split on the first occurence of the '=' character
                if (key && value) {
                    obj[decode(key)] = decode(value);
                }
            }
        });
        return obj as ServerAuthorizationCodeResponse;
    }
}
