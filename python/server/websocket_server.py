import asyncio
import websockets
from jsonrpc import JsonRpcRequest, JsonRpcResponse, error
from .app import app
from controllers import *


class WebsocketServer:
    """
        Websocket server core class. It will handle receiving and sending messages
    """

    def __init__(self, port):
        self.port = port
        self.start_server = websockets.serve(
            self.handler, "localhost", self.port)

    def run_forever(self):
        """
            Start to serve the server forever.
        """
        print("Starting websocket server...")
        asyncio.get_event_loop().run_until_complete(self.start_server)
        asyncio.get_event_loop().run_forever()

    async def handler(self, websocket, _):
        """
            Websocket handler
        """
        connection = WebsocketConnection(websocket)
        await connection.listen()


class WebsocketConnection:
    def __init__(self, websocket):
        self.websocket = websocket

    async def listen(self):
        while True:
            message = await self.websocket.recv()
            try:
                request = self.parse_request(message)
            except error.JsonRpcParseError as parse_error:
                response = JsonRpcResponse(
                    request=None,
                    error=parse_error,
                )
                await self.send_response(response)
            else:
                await self.process_request(request)

    async def process_request(self, request: JsonRpcRequest):
        try:
            print("< {0} {1}".format(request.request_id, request.method))

            result = app.call_procedure(request.method, request.params)
            response = JsonRpcResponse(
                request=request,
                result=result,
            )
            await self.send_response(response)
        except error.JsonRpcError as rpc_error:
            response = JsonRpcResponse(
                request=request,
                error=rpc_error,
            )
            await self.send_response(response)
        except Exception as e:
            response = JsonRpcResponse(
                request=request,
                error=error.JsonRpcError(500, "Server internal error", str(e)),
            )
            await self.send_response(response)
            raise e

    def parse_request(self, message: str) -> JsonRpcRequest:
        return JsonRpcRequest.from_json(message)

    async def send_response(self, response: JsonRpcResponse):
        data = response.to_json()
        await self.websocket.send(data)
        print("> {}".format(data))
