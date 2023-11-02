import {
    HttpClient as PipelineHttpClient,
    PipelineRequest,
    PipelineResponse,
    HttpHeaders as PipelineHeaders,
} from "@azure/core-rest-pipeline";
import { PipelineHttpHeadersImpl } from "./pipeline-http-headers";
import { HttpHeaders as CommonHttpHeaders } from "@azure/bonito-core";
import { DependencyName, inject } from "@azure/bonito-core/lib/environment";
import {
    HttpClient as CommonHttpClient,
    HttpResponse,
    MapHttpHeaders,
} from "@azure/bonito-core/lib/http";
import { RestError } from "./rest-error";

/**
 * Adapter class that acts as our custom http client
 * that accepts a request and returns a response using
 * the Shared Library Http Client interface
 */
export class BatchHttpClient implements PipelineHttpClient {
    private internalClient: CommonHttpClient = inject(
        DependencyName.HttpClient
    );

    public async sendRequest(
        request: PipelineRequest
    ): Promise<PipelineResponse> {
        try {
            const fetchHeaders = buildMapHeaders(request);

            const httpResponse = await this.internalClient.fetch(request.url, {
                method: request.method,
                headers: fetchHeaders,
                body: request.body as string,
            });

            const pipelineResponse: PipelineResponse =
                await buildPipelineResponse(httpResponse, request);

            return pipelineResponse;
        } catch (e: unknown) {
            if (e instanceof Error) {
                throw getError(e, request);
            }
            throw e;
        }
    }
}

/**
 * Gets the specific error
 */
function getError(e: Error, request: PipelineRequest): RestError {
    if (e && e?.name === "AbortError") {
        return e;
    } else {
        return new RestError(`Error sending request: ${e.message}`, {
            code: RestError.REQUEST_SEND_ERROR,
            request,
        });
    }
}

function buildMapHeaders(request: PipelineRequest): CommonHttpHeaders {
    const headers: MapHttpHeaders = new MapHttpHeaders();
    for (const [name, value] of request.headers) {
        headers.append(name, value);
    }

    return headers;
}

function buildPipelineHeaders(httpResponse: HttpResponse): PipelineHeaders {
    const responseHeaders = new PipelineHttpHeadersImpl(httpResponse.headers);
    return responseHeaders;
}

/**
 * Creates a pipeline response from a Fetch response;
 */
async function buildPipelineResponse(
    httpResponse: HttpResponse,
    request: PipelineRequest
): Promise<PipelineResponse> {
    const headers: PipelineHeaders = buildPipelineHeaders(httpResponse);

    const response: PipelineResponse = {
        request,
        headers,
        status: httpResponse.status,
    };

    response.bodyAsText = await httpResponse.text();
    return response;
}
