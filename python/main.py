"""
    Main module
"""

import signal
import server.websocket_server

signal.signal(signal.SIGINT, signal.SIG_DFL)

def run():
    """
        Main function of the app that start the server
    """
    ws_server = server.websocket_server.WebsocketServer(8765)
    ws_server.run_forever()

if __name__ == "__main__":
    run()

