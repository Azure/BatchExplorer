from time import sleep
from server.app import app


@app.procedure("foo")
async def foo(request, param1):
    print("got data", param1)
    for i in range(10):
        await request.send_stream({'a': i})
        sleep(1)
    return {'a': "this is the last"}


@app.procedure("simple")
def simple(request, param1):
    print("got data", param1)
    return {'a': "this is done"}
