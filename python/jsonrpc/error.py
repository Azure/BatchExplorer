import json


class JsonRpcErrorCodes:
    PARSE_ERROR = -32700
    INVALID_REQUEST = -32600
    METHOD_NOT_FOUND = -32601
    INVALID_PARAMS = -32602
    INTERNAL_ERROR = -32603
    BATCH_CLIENT_ERROR = -32604
    BAD_REQUEST = 400


JSONRPC_ERROR_MESSAGE = dict([
    (JsonRpcErrorCodes.PARSE_ERROR, "Parse error"),
    (JsonRpcErrorCodes.INVALID_REQUEST, "nvalid request"),
    (JsonRpcErrorCodes.METHOD_NOT_FOUND, "Method not found"),
    (JsonRpcErrorCodes.INVALID_PARAMS, "Invalid params"),
    (JsonRpcErrorCodes.INTERNAL_ERROR, "Internal error"),
])


class JsonRpcError(BaseException):
    """
        Class representing a JSON rpc error
    """

    def __init__(self, code: str, message: str, data: object = None):
        super().__init__()
        self.code = code
        self.message = message
        self.data = data or []

    def to_json(self):
        return json.dumps({
            'code': self.code,
            'message': self.message,
            'data': self.data,
        })


class JsonRpcParseError(JsonRpcError):
    def __init__(self, decode_error: json.JSONDecodeError, original: object):
        data = {
            'error': decode_error.msg,
            'request': original
        }
        super().__init__(JsonRpcErrorCodes.PARSE_ERROR,
                         JSONRPC_ERROR_MESSAGE[JsonRpcErrorCodes.PARSE_ERROR], data)


class JsonRpcInvalidRequestError(JsonRpcError):
    def __init__(self, data: object):
        code = JsonRpcErrorCodes.INVALID_REQUEST
        super().__init__(code, JSONRPC_ERROR_MESSAGE[code], data)


class JsonRpcInvalidParamsError(JsonRpcError):
    def __init__(self, message, data: object):
        code = JsonRpcErrorCodes.INVALID_PARAMS
        super().__init__(code, message, data)


class JsonRpcMethodNotFoundError(JsonRpcError):
    def __init__(self, method: str):
        data = dict({'methodName': method})
        code = JsonRpcErrorCodes.METHOD_NOT_FOUND
        super().__init__(code, JSONRPC_ERROR_MESSAGE[code], data)

