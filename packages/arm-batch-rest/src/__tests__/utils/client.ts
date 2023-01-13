import { ClientOptions } from "@azure-rest/core-client";
import batchClient, { BatchManagementClient } from "../../../src/generated";
import { ClientSecretCredential } from "@azure/identity";
import {
    HttpClient,
    PipelineResponse,
    PipelineRequest,
} from "@azure/core-rest-pipeline";

export class MockHttpClient implements HttpClient {
    private responseStatusCode: number;
    private rawResponseBody: string;

    constructor(statusCode: number, rawResponseBody: string) {
        this.responseStatusCode = statusCode;
        this.rawResponseBody = rawResponseBody;
    }

    public async sendRequest(
        request: PipelineRequest
    ): Promise<PipelineResponse> {
        const statusCode = this.responseStatusCode;
        const response: PipelineResponse = {
            status: statusCode,
            headers: request.headers,
            request: request,
        };

        response.bodyAsText = this.rawResponseBody;

        return response;
    }
}

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
