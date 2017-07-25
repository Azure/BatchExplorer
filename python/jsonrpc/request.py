import json
from server.aad_auth import AADAuth
from .error import JsonRpcParseError

class JsonRpcRequestOptions:
    def __init__(self, authentication):
        self.authentication = authentication

    @staticmethod
    def from_dict(data: dict):
        return JsonRpcRequestOptions(
            authentication=data["authentication"],
        )

class JsonRpcRequest:
    """
        Class for a json rpc request
    """

    def __init__(self, jsonrpc: str, method: str, params: any, options: JsonRpcRequestOptions, request_id: str):
        self.jsonrpc = jsonrpc
        self.method = method
        self.params = params
        self.request_id = request_id
        self.options = options
        if options.authentication:
            self.auth = AADAuth.from_dict(options.authentication)

    @staticmethod
    def from_json(json_str: str):
        try:
            data = json.loads(json_str)
            return JsonRpcRequest(
                jsonrpc=data['jsonrpc'],
                method=data['method'],
                params=data['params'],
                options=JsonRpcRequestOptions.from_dict(data['options']),
                request_id=data['id'],
            )
        except json.JSONDecodeError as error:
            raise JsonRpcParseError(error, json_str)
