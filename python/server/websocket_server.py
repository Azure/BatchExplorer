import asyncio
import websockets


class WebsocketServer:
    """
        Websocket server core class. It will handle receiving and sending messages
    """

    def __init__(self, port):
        self.port = port
        self.start_server = websockets.serve(self.handler, "localhost", self.port)

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
        while True:
            message = await websocket.recv()
            print("< {}".format(message))

            greeting = "Hello {}!".format(message)
            await websocket.send(greeting)
            print("> {}".format(greeting))
