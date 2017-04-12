/**
 * @class
 * Initializes a new instance of the StorageError class.
 * @constructor
 * @summary An error response received from the Azure Storage service.
 *
 * @member {string} [code] An identifier for the error. Codes are invariant
 * and are intended to be consumed programmatically.
 *
 * @member {string} [message] A message describing the error, intended to be
 * suitable for display in a user interface.
 *
 * @member {string} [requestId] RequestId of the error, used for viewing logs in the MS system.
 *
 * @member {string} [statusCode] The HTTP status code of the error.
 */
export interface StorageError {
    code?: string;
    message?: string;
    requestId?: string;
    statusCode: number;
}
