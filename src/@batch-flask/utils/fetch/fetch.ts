import * as HttpsProxyAgent from "https-proxy-agent";
import nodeFetch, { RequestInit } from "node-fetch";

import { log } from "@batch-flask/utils/logging";

export async function fetch(url: string, options: RequestInit = {}) {
    const instanceOptions = {
        ...options,
    };
    if (!options.agent && process.env.HTTP_PROXY) {
        // TODO-TIM remove
        log.info("Calling node fetch with HTTP_PROXY", process.env.HTTP_PROXY);
        instanceOptions.agent = new HttpsProxyAgent(process.env.HTTP_PROXY);
    } else {
        log.info("Calling node fetch without HTTP_PROXY");
    }
    return nodeFetch(url, instanceOptions);
}
