import asyncio
import traceback
import logging
from jsonrpc import JsonRpcRequest, JsonRpcResponse, error
from websockets import server
from websockets.exceptions import ConnectionClosed
from .response_stream import ResponseStream
from .app import app
from controllers import *

class WebsocketServer:
    """
        Websocket server core class. It will handle receiving and sending messages
    """

    def __init__(self, port):
        self.port = port
        self.start_server = server.serve(
            self.handler, "127.0.0.1", self.port)

    async def run_forever(self):
        """
            Start to serve the server forever.
        """
        print("Starting websocket server...")
        async with server.serve(self.handler, "127.0.0.1", self.port):
            print("Started server")
            await asyncio.Future()

    async def handler(self, websocket, _):
        """
            Websocket handler
        """
        connection = WebsocketConnection(websocket)
        try:
            await connection.listen()
        except ConnectionClosed:
            logging.info("Websocket connection closed.")




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
            except ConnectionClosed:
                logging.info("Websocket connection closed.")
            else:
                await self.process_request(request)

    async def process_request(self, request: JsonRpcRequest):
        try:
            print("< {0} {1}".format(request.request_id, request.method))

            result = await app.call_procedure(request)

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
            print("Error", type(e), e.args)
            print(traceback.format_exc())
            response = JsonRpcResponse(
                request=request,
                error=error.JsonRpcError(500, "Server internal error", str(e)),
            )
            await self.send_response(response)

    def parse_request(self, message: str) -> JsonRpcRequest:
        return JsonRpcRequest.from_json(self, message)

    async def send_response(self, response: JsonRpcResponse):
        data = response.to_json()
        print("Sending response")
        await self.websocket.send(data)
        print("> {}".format(data))

    def __handle_response_stream(self, request: JsonRpcRequest, stream: ResponseStream):
        stream.onData(lambda data, last: self.__send_stream_response(request, data, last))

    async def __send_stream_response(self, request: JsonRpcRequest, data, last: bool):
        response = JsonRpcResponse(
            request=request,
            result=data,
            stream=not last,
        )
        await self.send_response(response)
