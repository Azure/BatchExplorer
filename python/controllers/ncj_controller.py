from server.app import app

import azure.batch_extensions as batch
from jsonrpc import JsonRpcErrorCodes, error, JsonRpcRequest
from msrestazure.azure_active_directory import AdalAuthentication


from azure.common.credentials import ServicePrincipalCredentials
import azure.batch_extensions as batch
from azure.batch_extensions import models

@app.procedure("submitNCJ")
def submitNCJ(request: JsonRpcRequest, template, parameters):
    client = request.auth.client
    print(client)
    job_json = client.job.expand_template(template, parameters)
    job = client.job.jobparameter_from_json(job_json)
    #client.job.add(job)
    return {"what": "it works"}
