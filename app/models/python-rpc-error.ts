/**
 * @class
 * Initializes a new instance of the StorageError class.
 * @constructor
 * @summary An error response received from the Azure Storage service.
 *
 * @member {number} [code] An identifier for the error. Codes are invariant
 * and are intended to be consumed programmatically.
 *
 * @member {string} [message] A message describing the error, intended to be
 * suitable for display in a user interface.
 *
 * @member {any} [data] JSON data returned with the error.
 *
 */
export interface PythonPRpcError {
    code?: number;
    message?: string;
    data?: any;
}
