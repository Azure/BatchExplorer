import { HttpRequestMetadata } from "@batch/ui-common";

/**
 * Common options that can be set when performing operations
 */
export interface OperationOptions {
    /**
     * Used to associate a friendly name with this operation.
     * Should be slash-separated and UpperCamelCase by
     * convention. For example: "TaskForm/SubmitTask"
     */
    commandName?: string;
}

/**
 * From operation options, create an return an HTTP request metadata
 * object.
 *
 * @param opts The operation options to use. Allows passing in undefined (which
 *             makes this function a no-op) since operation options are usually
 *             nullable.
 * @returns Metadata that can be used in an HttpClient request.
 */
export function buildRequestMetadata(
    opts?: OperationOptions
): HttpRequestMetadata | undefined {
    if (!opts) {
        return undefined;
    }

    let metadata: HttpRequestMetadata | undefined;
    if (opts?.commandName) {
        metadata = {
            commandName: opts.commandName,
        };
    }

    return metadata;
}
