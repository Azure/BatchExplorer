from server.app import app

from jsonrpc import JsonRpcRequest


@app.procedure("submitNCJ")
def submitNCJ(request: JsonRpcRequest, template, parameters):
    client = request.auth.client
    print(client)
    job_json = client.job.expand_template(template, parameters)
    job = client.job.jobparameter_from_json(job_json)
    client.job.add(job)
    return {"what": "it works"}
