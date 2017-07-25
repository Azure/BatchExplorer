from server.app import app
from server import ResponseStream
from threading import Thread
from time import sleep


def send_stream(stream: ResponseStream):
    for i in range(10):
        stream.send_stream({'a': i})
        sleep(1)
        stream.send_stream({'a': "this is the last"}, last=True)


@app.procedure("foo")
def foo(request, param1):
    print("got data", param1)
    stream = ResponseStream()
    Thread(send_stream, args=[stream])
    return stream
