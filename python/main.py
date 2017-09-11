"""
    Main module
"""

import signal
import sys
import server.websocket_server

signal.signal(signal.SIGINT, signal.SIG_DFL)

def run():
    """
        Main function of the app that start the server
    """
    port = 8765

    if len(sys.argv) > 1:
        port = int(sys.argv[1])

    ws_server = server.websocket_server.WebsocketServer(port)
    ws_server.run_forever()

if __name__ == "__main__":
    run()
