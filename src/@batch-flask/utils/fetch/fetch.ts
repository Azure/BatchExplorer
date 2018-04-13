import * as HttpsProxyAgent from "https-proxy-agent";
import nodeFetch, { Headers, RequestInit } from "node-fetch";

import { log } from "@batch-flask/utils/logging";

export async function fetch(url: string, options: RequestInit = {}) {
    const instanceOptions = {
        ...options,
    };
    if (!options.agent && process.env.HTTP_PROXY) {
        // TODO-TIM remove
        log.info("Calling node fetch with HTTP_PROXY");
        instanceOptions.agent = new HttpsProxyAgent(process.env.HTTP_PROXY);
    } else {
        log.info("Calling node fetch without HTTP_PROXY");
    }

    if (!options.headers) {
        options.headers = new Headers();
    }
    if (options.headers instanceof Headers) {
        options.headers.set("User-Agent", "Mozilla/5.0");
    } else {
        options.headers["User-Agent"] = "Mozilla/5.0";
    }

    const response = await nodeFetch(url, instanceOptions);
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        const content = await response.text();
        log.error(`Error fetch ${url}`, content);
        throw response;
    }
}
