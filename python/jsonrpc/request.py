import json
from .error import JsonRpcParseError


class JsonRpcRequest:
    """
        Class for a json rpc request
    """

    def __init__(self, jsonrpc: str, method: str, params: any, request_id: str):
        self.jsonrpc = jsonrpc
        self.method = method
        self.params = params
        self.request_id = request_id

    @staticmethod
    def from_json(json_str: str):
        try:
            data = json.loads(json_str)
            return JsonRpcRequest(
                jsonrpc=data.jsonrpc,
                method=data.method,
                params=data.params,
                request_id=data.id,
            )
        except json.JSONDecodeError as error:
            raise JsonRpcParseError(error, json_str)
