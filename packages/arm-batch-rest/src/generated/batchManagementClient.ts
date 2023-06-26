// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { getClient, ClientOptions } from "@azure-rest/core-client";
import { TokenCredential } from "@azure/core-auth";
import { BatchManagementClient } from "./clientDefinitions";

/**
 * Initialize a new instance of the class BatchManagementClient class.
 * @param credentials type: TokenCredential
 */
export default function createClient(
    credentials: TokenCredential,
    options: ClientOptions = {}
): BatchManagementClient {
    const baseUrl = options.baseUrl ?? `https://management.azure.com`;
    options.apiVersion = options.apiVersion ?? "2023-05-01";
    options = {
        ...options,
        credentials: {
            scopes: ["https://management.azure.com/.default"],
        },
    };

    const userAgentInfo = `azsdk-js-arm-batch-rest/1.0.0-beta.1`;
    const userAgentPrefix =
        options.userAgentOptions && options.userAgentOptions.userAgentPrefix
            ? `${options.userAgentOptions.userAgentPrefix} ${userAgentInfo}`
            : `${userAgentInfo}`;
    options = {
        ...options,
        userAgentOptions: {
            userAgentPrefix,
        },
    };

    const client = getClient(
        baseUrl,
        credentials,
        options
    ) as BatchManagementClient;

    return client;
}
