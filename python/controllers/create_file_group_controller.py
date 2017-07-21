import os
import azure.batch_extensions as batch

from server.app import app
from jsonrpc import JsonRpcErrorCodes, error
from msrestazure.azure_active_directory import AdalAuthentication

SUBDIR_FILTER = "**\\*"

PARAM_PREFIX = "prefix"
PARAM_FULL_PATH = "fullPath"
PARAM_FLATTEN = "flatten"
PARAM_ACCOUNT_NAME = "name"
PARAM_ACCOUNT_PROPERTIES = "properties"
PARAM_ACCOUNT_URL = "accountEndpoint"
PARAM_ACCOUNT_SUBSCRIPTION = "subscription"
PARAM_ACCOUNT_SUBSCRIPTION_ID = "subscriptionId"

PARAM_INDEX_BATCH_TOKEN = 0
PARAM_INDEX_ARM_TOKEN = 1
PARAM_INDEX_NAME = 2
PARAM_INDEX_DIRECTORY = 3
PARAM_INDEX_OPTIONS = 4
PARAM_INDEX_ACCOUNT = 5

ERROR_REQUIRED_PARAM = "{} is a required parameter"

@app.procedure("create_file_group")
def create_file_group(params):
    batchToken, armToken = __validateAuthTokenParam(params)
    name, directory = __validateRequiredGroupParams(params)
    accountName, accountUrl, subscriptionId = __validateAccountParams(params)
    options = params[PARAM_INDEX_OPTIONS]

    # default these parameters as they are optional
    prefix, flatten, fullPath = [None, False, False]

    if options:
        if options.get(PARAM_PREFIX):
            prefix = options.get(PARAM_PREFIX)

        if options.get(PARAM_FULL_PATH):
            fullPath = options.get(PARAM_FULL_PATH)

        if options.get(PARAM_FLATTEN):
            flatten = options.get(PARAM_FLATTEN)

    # If fullPath is true, the the prefix becomes the directory path.
    # Any existing prefix is overwritten/ignored
    if fullPath:
        prefix = directory.replace(SUBDIR_FILTER, "")

    # Need credentials for both Batch and ARM
    batchCreds = AdalAuthentication(lambda: {"accessToken":batchToken})
    armCreds = AdalAuthentication(lambda: {"accessToken":armToken, "tokenType": "Bearer"})

    # Create extension client
    client = batch.BatchExtensionsClient(
        credentials=batchCreds,
        batch_account=accountName,
        base_url=accountUrl,
        subscription_id=subscriptionId,
        mgmt_credentials=armCreds)

    try:
        client.file.upload(directory, name, prefix, flatten, __uploadCallback)
    except ValueError as valueError:
        raise error.JsonRpcError(
            code=JsonRpcErrorCodes.BATCH_CLIENT_ERROR,
            message="Failed to upload files to file group",
            data={"original": str(valueError)})

    # just return this count to the user, can do something better later
    # TODO: keep track of uploading files in the callback below and remove this code.
    uploadCount = 0
    for root, dirs, files in os.walk(directory.replace(SUBDIR_FILTER, "")):
        uploadCount += len(files)

    return {
        "uploaded": uploadCount,
    }

# Callback from file upload. Anna is going to change to return filename as well.
# TODO: Create a dictionary and pass back upload progress to the caller.
def __uploadCallback(param1, param2):
    print("uploading {} of {} bytes".format(param1, param2))

# Check name and directory input parameters
def __validateRequiredGroupParams(params):
    name = params[PARAM_INDEX_NAME]
    directory = params[PARAM_INDEX_DIRECTORY]

    if not name:
        raise __getRequiredParameterError("File group name")
    elif not directory:
        raise __getRequiredParameterError("File group source directory")
    else:
        return [name, directory]

# Check that the auth token was provided
def __validateAuthTokenParam(params):
    if not params[PARAM_INDEX_BATCH_TOKEN]:
        raise __getRequiredParameterError("Batch token")
    elif not params[PARAM_INDEX_ARM_TOKEN]:
        raise __getRequiredParameterError("ARM token")
    else:
        return [
            params[PARAM_INDEX_BATCH_TOKEN],
            params[PARAM_INDEX_ARM_TOKEN]
        ]

# Check account parameters that we need
# TODO: No doubt there is an easier way to do this ...
def __validateAccountParams(params):
    account = params[PARAM_INDEX_ACCOUNT]

    if account is None:
        raise __getRequiredParameterError("Batch account")
    elif account.get(PARAM_ACCOUNT_NAME) is None:
        raise __getRequiredParameterError("Batch account name")
    elif account.get(PARAM_ACCOUNT_PROPERTIES) is None:
        raise __getRequiredParameterError("Batch account properties")
    elif account.get(PARAM_ACCOUNT_PROPERTIES).get(PARAM_ACCOUNT_URL) is None:
        raise __getRequiredParameterError("Batch account URL")
    elif account.get(PARAM_ACCOUNT_SUBSCRIPTION) is None:
        raise __getRequiredParameterError("Batch account subscription")
    elif account.get(PARAM_ACCOUNT_SUBSCRIPTION).get(PARAM_ACCOUNT_SUBSCRIPTION_ID) is None:
        raise __getRequiredParameterError("Batch account subscription ID")
    else:
        return [
            account.get(PARAM_ACCOUNT_NAME),
            "https://" + account.get(PARAM_ACCOUNT_PROPERTIES).get(PARAM_ACCOUNT_URL),
            account.get(PARAM_ACCOUNT_SUBSCRIPTION).get(PARAM_ACCOUNT_SUBSCRIPTION_ID),
        ]

def __getRequiredParameterError(parameter):
    return error.JsonRpcError(
        code=JsonRpcErrorCodes.INVALID_PARAMS,
        message=ERROR_REQUIRED_PARAM.format(parameter),
        data={"status":400})
