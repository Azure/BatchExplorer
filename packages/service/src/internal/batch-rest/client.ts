/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 */

import { TokenCredential } from "@azure/core-auth";
import { ClientOptions } from "@azure-rest/core-client";
import { BatchClient } from "./generated/src";
import createClient from "./generated/src/batchClient";
import { BatchHttpClient } from "../client-http/batch-http-client";

export function createBatchClient(
    endpoint: string,
    options: ClientOptions = {},
    credential?: TokenCredential
): BatchClient {
    if (!options.httpClient) {
        options = {
            ...options,
            httpClient: new BatchHttpClient(),
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const credentials = credential ?? (undefined as any);
    return createClient(endpoint, credentials, options);
}
