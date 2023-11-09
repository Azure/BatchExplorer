import { HttpResponse as AzureCoreHttpResponse } from "@azure-rest/core-client";
import { UnexpectedStatusCodeError } from "@azure/bonito-core";
import { BatchErrorOutput } from "./internal/batch-rest";

interface DataPlaneErrorResponse extends AzureCoreHttpResponse {
    status: string;
    body: BatchErrorOutput;
}

export function createDataPlaneUnexpectedStatusCodeError(
    res: DataPlaneErrorResponse
): UnexpectedStatusCodeError {
    return new UnexpectedStatusCodeError(
        "The Batch data plane returned an unexpected status code",
        +res.status,
        JSON.stringify(res.body)
    );
}
