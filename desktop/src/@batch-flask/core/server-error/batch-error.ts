/**
 * @class
 * Initializes a new instance of the BatchError class.
 * @constructor
 * @summary An error response received from the Azure Batch service.
 *
 * @member {string} [code] An identifier for the error. Codes are invariant
 * and are intended to be consumed programmatically.
 *
 * @member {object} [message] A message describing the error, intended to be
 * suitable for display in a user interface.
 *
 * @member {string} [message.lang]
 *
 * @member {string} [message.value]
 *
 * @member {array} [values] A collection of key-value pairs containing
 * additional details about the error.
 *
 */
export interface BatchError {
    code?: string;
    message?: ErrorMessage;
    body?: BatchErrorBody;
    statusCode: number;
}

export interface BatchErrorBody {
    values?: BatchErrorDetail[];
}

/**
 * @class
 * Initializes a new instance of the ErrorMessage class.
 * @constructor
 * @summary An error message received in an Azure Batch error response.
 *
 * @member {string} [lang] The language code of the error message.
 *
 * @member {string} [value] The text of the message.
 *
 */
export interface ErrorMessage {
    lang?: string;
    value?: string;
}

/**
 * @class
 * Initializes a new instance of the BatchErrorDetail class.
 * @constructor
 * @summary An item of additional information included in an Azure Batch error
 * response.
 *
 * @member {string} [key] An identifier specifying the meaning of the Value
 * property.
 *
 * @member {string} [value] The additional information included with the error
 * response.
 *
 */
export interface BatchErrorDetail {
    key?: string;
    value?: string;
}
