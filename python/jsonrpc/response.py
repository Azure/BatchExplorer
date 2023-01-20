import json
from typing import Any, Optional
from .error import JsonRpcError
from .request import JsonRpcRequest


class JsonRpcResponse:
    """
        Class for a json rpc response.
    """

    def __init__(self, request: Optional[JsonRpcRequest], result: Any=None, stream=False, error: JsonRpcError=None):
        self.jsonrpc = "2.0"
        self.result = result
        self.error = error
        self.request = request
        self.stream = stream

    def to_json(self) -> str:
        """
            Return the json object of the response matching the JSONRPC 2.0 specs
        """
        data = {
            'jsonrpc': self.jsonrpc,
            'stream': self.stream,
        }

        if self.request:
            data['id'] = self.request.request_id
        else:
            data['id'] = None

        if self.result:
            data['result'] = self.result

        if self.error:
            data['error'] = self.error.__dict__

        return json.dumps(data)
