import { ClientOptions } from "@azure-rest/core-client";
import batchClient, { BatchManagementClient } from "../../../src/generated";
import { ClientSecretCredential } from "@azure/identity";

export function generateClient(options?: ClientOptions): BatchManagementClient {
    const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;
    const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
    const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;

    const credential = new ClientSecretCredential(
        AZURE_TENANT_ID!,
        AZURE_CLIENT_ID!,
        AZURE_CLIENT_SECRET!
    );

    return batchClient(credential, {
        ...options,
    });
}
