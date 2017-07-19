from os import listdir
import azure.batch_extensions as batch
from server.app import app

SUBDIR_FILTER = "**\\*"

PARAM_PREFIX = "prefix"
PARAM_FULL_PATH = "fullPath"
PARAM_FLATTEN = "flatten"
PARAM_ACCOUNT_NAME = "name"
PARAM_ACCOUNT_PROPERTIES = "properties"
PARAM_ACCOUNT_URL = "accountEndpoint"

PARAM_INDEX_NAME = 0
PARAM_INDEX_DIRECTORY = 1
PARAM_INDEX_OPTIONS = 2
PARAM_INDEX_ACCOUNT = 3

@app.procedure("create_file_group")
def create_file_group(params):
    name, directory = __validateRequiredGroupParams(params)
    accountName, accountUrl = __validateAccountParams(params)
    options = params[PARAM_INDEX_OPTIONS]
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

    # Create extension client
    # TODO: Pass in AAD Auth Token
    client = batch.BatchExtensionsClient(
        batch_account=accountName,
        base_url=accountUrl)

    try:
        client.file.upload(directory, name, prefix, flatten, __uploadCallback)
    except Exception as error:
        raise Exception("Failed to upload files to file group: " + str(error))

    # just return this count to the user, can do something better later
    # TODO: keep track of uploading files in the callback below.
    uploadCount = len(listdir(directory.replace(SUBDIR_FILTER, "")))

    return {
        "uploadCount": uploadCount,
    }

def __uploadCallback(param1, param2):
    print("uploading {} of {} bytes".format(param1, param2))

# Check name and directory input parameters
def __validateRequiredGroupParams(params):
    name = params[PARAM_INDEX_NAME]
    directory = params[PARAM_INDEX_DIRECTORY]

    if name is None:
        raise Exception("File group name is a required parameter")
    elif directory is None:
        raise Exception("File group source directory is a required parameter")
    else:
        return [name, directory]

# Check account parameters that we need
def __validateAccountParams(params):
    account = params[PARAM_INDEX_ACCOUNT]

    if account is None:
        raise Exception("Batch account is a required parameter")
    elif account.get(PARAM_ACCOUNT_NAME) is None:
        raise Exception("Batch account name is a required parameter")
    elif account.get(PARAM_ACCOUNT_PROPERTIES) is None:
        raise Exception("Batch account properties is a required parameter")
    elif account.get(PARAM_ACCOUNT_PROPERTIES).get(PARAM_ACCOUNT_URL) is None:
        raise Exception("Batch account URL is a required parameter")
    else:
        return [
            account.get(PARAM_ACCOUNT_NAME),
            "https://" + account.get(PARAM_ACCOUNT_PROPERTIES).get(PARAM_ACCOUNT_URL)
        ]
