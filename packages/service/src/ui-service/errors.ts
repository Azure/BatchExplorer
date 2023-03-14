export class UnexpectedStatusCodeError extends Error {
    constructor(message: string, statusCode: number, responseBody?: string) {
        message = `${message} [unexpected ${statusCode} status]`;
        if (responseBody != null) {
            message += `\nResponse body:\n${responseBody}`;
        }
        super(message);
    }
}
