/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 */

import { TokenCredential } from "@azure/core-auth";
import { ClientOptions } from "@azure-rest/core-client";
import { BatchManagementClient } from "./generated";
import createClient from "./generated/batchManagementClient";
import { BatchHttpClient } from "./http/batch-http-client";

export default function generateBatchManagementClient(
    options: ClientOptions = {},
    credential?: TokenCredential
): BatchManagementClient {
    if (!options.httpClient) {
        options = {
            ...options,
            httpClient: new BatchHttpClient(),
        };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const credentials = credential ?? (undefined as any);
    return createClient(credentials, options);
}
