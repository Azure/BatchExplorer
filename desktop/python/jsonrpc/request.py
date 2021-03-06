import json
import asyncio
import threading
from server.aad_auth import AADAuth
from .error import JsonRpcParseError
stream_loop = asyncio.new_event_loop()

def worker():
    stream_loop.run_forever()
    return


t = threading.Thread(target=worker)
t.start()


class JsonRpcRequestOptions:
    def __init__(self, authentication):
        self.authentication = authentication

    @staticmethod
    def from_dict(data: dict):
        return JsonRpcRequestOptions(
            authentication=data.get("authentication", None),
        )


class JsonRpcRequest:
    """
        Class for a json rpc request
    """

    def __init__(self,
                 jsonrpc: str,
                 method: str,
                 params: any,
                 options: JsonRpcRequestOptions,
                 request_id: str,
                 connection):
        """
            Json rpc request to be passed around for the request time.AADAuth
            :param jsonrpc str: Verison of the json rpc standard
            :param method str: Name of the controller action to call
            :param params List[str]: Params to pass to the controller action
            :param options JsonRpcRequestOptions: Options sent along with the request
            :param request_id str: Id of the request
            :param connection WebsocketConnection: Connection to send back messages
        """
        self.jsonrpc = jsonrpc
        self.method = method
        self.params = params
        self.request_id = request_id
        self.options = options
        self.connection = connection

        if options.authentication:
            self.auth = AADAuth.from_dict(options.authentication)

    async def send_stream(self, data: any):
        from .response import JsonRpcResponse
        response = JsonRpcResponse(
            request=self,
            result=data,
            stream=True,
        )
        await self.connection.send_response(response)

    def push_stream(self, data: any):
        stream_loop.call_soon_threadsafe(
            lambda: stream_loop.create_task(self.send_stream(data)))

    @staticmethod
    def from_json(connection, json_str: str):
        try:
            data = json.loads(json_str)
            return JsonRpcRequest(
                connection=connection,
                jsonrpc=data['jsonrpc'],
                method=data['method'],
                params=data['params'],
                options=JsonRpcRequestOptions.from_dict(data['options']),
                request_id=data['id'],
            )
        except json.JSONDecodeError as error:
            raise JsonRpcParseError(error, json_str)
