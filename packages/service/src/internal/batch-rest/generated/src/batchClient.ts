// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { getClient, ClientOptions } from "@azure-rest/core-client";
import { logger } from "./logger.js";
import { TokenCredential } from "@azure/core-auth";
import { BatchClient } from "./clientDefinitions.js";

/**
 * Initialize a new instance of `BatchClient`
 * @param endpointParam - Batch account endpoint (for example: https://batchaccount.eastus2.batch.azure.com).
 * @param credentials - uniquely identify client credential
 * @param options - the parameter for all optional parameters
 */
export default function createClient(
  endpointParam: string,
  credentials: TokenCredential,
  options: ClientOptions = {},
): BatchClient {
  const endpointUrl = options.endpoint ?? options.baseUrl ?? `${endpointParam}`;
  options.apiVersion = options.apiVersion ?? "2024-02-01.19.0";
  const userAgentInfo = `azsdk-js-batch-rest/1.0.0-beta.1`;
  const userAgentPrefix =
    options.userAgentOptions && options.userAgentOptions.userAgentPrefix
      ? `${options.userAgentOptions.userAgentPrefix} ${userAgentInfo}`
      : `${userAgentInfo}`;
  options = {
    ...options,
    userAgentOptions: {
      userAgentPrefix,
    },
    loggingOptions: {
      logger: options.loggingOptions?.logger ?? logger.info,
    },
    telemetryOptions: {
      clientRequestIdHeaderName:
        options.telemetryOptions?.clientRequestIdHeaderName ??
        "client-request-id",
    },
    credentials: {
      scopes: options.credentials?.scopes ?? [
        "https://batch.core.windows.net//.default",
      ],
    },
  };

  const client = getClient(endpointUrl, credentials, options) as BatchClient;

  return client;
}
