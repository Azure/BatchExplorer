from server.app import app

from jsonrpc import JsonRpcRequest


@app.procedure("submit-ncj-job")
def submitNcjJob(request: JsonRpcRequest, template, parameters):
    client = request.auth.client
    print(client)
    job_json = client.job.expand_template(template, parameters)
    job = client.job.jobparameter_from_json(job_json)
    client.job.add(job)
    return {"what": "it works"}


@app.procedure("create-ncj-pool")
def createNcjPool(request: JsonRpcRequest, template, parameters):
    print("Got template", template)
    client = request.auth.client
    pool_json = client.pool.expand_template(template, parameters)
    print("Expand is done...")
    pool = client.pool.poolparameter_from_json(pool_json)
    print("Poolparm from json is done")
    client.pool.add(pool)
    return {"what": "it works"}
