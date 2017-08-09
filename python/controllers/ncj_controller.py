import azure.batch.models.batch_error
from server.app import app
import logging
from jsonrpc import JsonRpcRequest
from jsonrpc.error import JsonRpcError

@app.procedure("submit-ncj-job")
def submit_ncj_job(request: JsonRpcRequest, template, parameters):
    print("Got template", template)
    client = request.auth.client
    job_json = client.job.expand_template(template, parameters)
    job = client.job.jobparameter_from_json(job_json)
    print("Job is", job)
    client.job.add(job)
    return {"what": "it works"}

@app.procedure("create-ncj-pool")
def create_ncj_pool(request: JsonRpcRequest, template, parameters):
    print("Got template", template)
    client = request.auth.client
    pool_json = client.pool.expand_template(template, parameters)
    print("Expand is done...")
    pool = client.pool.poolparameter_from_json(pool_json)
    print("Poolparm from json is done")
    client.pool.add(pool)
    return {"what": "it works"}

@app.procedure("expand-ncj-pool")
def expand_ncj_pool(request: JsonRpcRequest, template, parameters):
    print("Got template", template)
    client = request.auth.client
    pool_json = client.pool.expand_template(template, parameters)
    return pool_json
