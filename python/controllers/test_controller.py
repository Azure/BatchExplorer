from server.app import app
from server import ResponseStream
from threading import Thread
from time import sleep
import asyncio

stream_loop = asyncio.new_event_loop()

async def send_stream(stream: ResponseStream):
    for i in range(10):
        await stream.send({'a': i})
        sleep(1)
    await stream.send({'a': "this is the last"}, last=True)

def start_listen(stream):
    stream_loop.run_until_complete(send_stream(stream))
    stream_loop.close()

@app.procedure("foo")
def foo(request, param1):
    print("got data", param1)
    stream = ResponseStream()
    thread = Thread(target = start_listen, args=[stream])
    thread.start()
    return stream
