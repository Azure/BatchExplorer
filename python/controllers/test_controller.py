from server.app import app

print("Registering controller")

@app.procedure("foo")
def foo(params):
    print("got data", params)

    return {"what": "it works!"}
