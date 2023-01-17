import {
    HttpClient as PipelineHttpClient,
    PipelineRequest,
    PipelineResponse,
    HttpHeaders as PipelineHeaders,
} from "@azure/core-rest-pipeline";
import { PipelineHttpHeadersImpl } from "./PipelineHttpHeaders";
import { HttpHeaders as FetchHttpHeaders } from "@batch/ui-common";
import { DependencyName, inject } from "@batch/ui-common/lib/environment";
import {
    HttpClient as CommonHttpClient,
    HttpResponse,
    MapHttpHeaders,
} from "@batch/ui-common/lib/http";
import { RestError } from "./restError";

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
            const fetchHeaders = buildFetchHeaders(request);

            const httpResponse = await this.internalClient.fetch(request.url, {
                method: request.method,
                headers: fetchHeaders,
                body: request.body as string,
            });

            const pipelineResponse: PipelineResponse =
                await buildPipelineResponse(httpResponse, request);

            return pipelineResponse;
        } catch (e: any) {
            throw getError(e, request);
        }
    }
}

/**
 * Gets the specific error
 */
function getError(e: RestError, request: PipelineRequest): RestError {
    if (e && e?.name === "AbortError") {
        return e;
    } else {
        return new RestError(`Error sending request: ${e.message}`, {
            code: e?.code ?? RestError.REQUEST_SEND_ERROR,
            request,
        });
    }
}

function buildFetchHeaders(request: PipelineRequest): FetchHttpHeaders {
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
