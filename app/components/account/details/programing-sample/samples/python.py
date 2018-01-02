import azure.batch.batch_service_client as batch
import azure.batch.batch_auth as batchauth

# Batch account credentials
BATCH_ACCOUNT_NAME = "{0}"
BATCH_ACCOUNT_URL = "{1}"
BATCH_ACCOUNT_KEY = "{2}"

# Create a Batch service client. We'll now be interacting with the Batch
# service in addition to Storage.
credentials = batchauth.SharedKeyCredentials(BATCH_ACCOUNT_NAME,
                                             BATCH_ACCOUNT_KEY)

batch_client = batch.BatchServiceClient(
    credentials,
    base_url=BATCH_ACCOUNT_URL)

# Perform action with the batch_client
jobs = batch_client.job.list()

for job in jobs:
    print(job.id)
