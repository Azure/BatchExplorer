import HttpsProxyAgent from "https-proxy-agent";

import nodeFetch, { RequestInit } from "node-fetch";

export async function fetch(url: string, options: RequestInit = {}) {
    const instanceOptions = {
        ...options,
    };

    if (!options.agent && process.env.HTTP_PROXY) {
        instanceOptions.agent = new HttpsProxyAgent(process.env.HTTP_PROXY);
    }
    return nodeFetch(url, instanceOptions);
}
