from server.app import app

import azure.batch_extensions as batch
from jsonrpc import JsonRpcErrorCodes, error
from msrestazure.azure_active_directory import AdalAuthentication


from azure.common.credentials import ServicePrincipalCredentials
import azure.batch_extensions as batch
from azure.batch_extensions import models

@app.procedure("submitNCJ")
def submitNCJ(params):
    BATCH_ENDPOINT = "https://anasbatchaccount.eastus.batch.azure.com"
    BATCH_ACCOUNT = "anasbatchaccount"
    # Set up client
    client = batch.BatchExtensionsClient(
        base_url=BATCH_ENDPOINT,
        batch_account=BATCH_ACCOUNT)

    job_json = client.job.expand_template(params[0], params[1])
    job = client.job.jobparameter_from_json(job_json)
    client.job.add(job)
    return {"what": "it works2!"}
