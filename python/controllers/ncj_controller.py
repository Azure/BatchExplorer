from server.app import app


@app.procedure("submitNCJ")
def submitNCJ(params):
    print("got data", params)
    return {"what": "it works!", "params" : params}
