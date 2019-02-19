# """
#     Main module
# """
import core.batch_ext
core.batch_ext.init()

#pylint: disable=wrong-import-position,wrong-import-order
import logging
import signal
import sys
import server.websocket_server

signal.signal(signal.SIGINT, signal.SIG_DFL)


def setup_logging():
    logging.basicConfig(format='%(message)s')


def run():
    """
        Main function of the app that start the server
    """
    port = 8765
    setup_logging()

    if len(sys.argv) > 1:
        port = int(sys.argv[1])

    ws_server = server.websocket_server.WebsocketServer(port)
    ws_server.run_forever()


if __name__ == "__main__":
    run()
