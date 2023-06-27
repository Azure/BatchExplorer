# """
#     Main module
# """
import asyncio
import logging
import signal
import sys
import server.websocket_server

signal.signal(signal.SIGINT, signal.SIG_DFL)


def setup_logging():
    logging.basicConfig(format='%(message)s', level="INFO")


async def main():
    """
        Main function of the app that start the server
    """
    port = 8765
    setup_logging()

    if len(sys.argv) > 1:
        port = int(sys.argv[1])

    ws_server = server.websocket_server.WebsocketServer(port)
    await ws_server.run_forever()



if __name__ == "__main__":
    asyncio.run(main())
