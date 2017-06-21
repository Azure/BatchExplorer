from server.app import app

@app.procedure("foo")
def foo(params):
    print("got data", params)

    return {"what": "it works!"}
