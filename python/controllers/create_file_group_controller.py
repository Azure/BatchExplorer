import os

from server.app import app
from jsonrpc import JsonRpcErrorCodes, error, JsonRpcRequest

# used for string replacement so i think it needs to stay like this.
SUBDIR_FILTER = "**/*"

PARAM_PREFIX = "prefix"
PARAM_FULL_PATH = "fullPath"
PARAM_FLATTEN = "flatten"
PARAM_ACCOUNT_NAME = "name"
PARAM_ACCOUNT_PROPERTIES = "properties"

PARAM_INDEX_BATCH_TOKEN = 0
PARAM_INDEX_ARM_TOKEN = 1
PARAM_INDEX_NAME = 2
PARAM_INDEX_DIRECTORY = 3
PARAM_INDEX_OPTIONS = 4
PARAM_INDEX_ACCOUNT = 5

ERROR_REQUIRED_PARAM = "{} is a required parameter"


@app.procedure("create_file_group")
def create_file_group(request: JsonRpcRequest, name, directory, options):
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

    try:
        request.auth.client.file.upload(directory, name, prefix, flatten, __uploadCallback)
    except ValueError as valueError:
        raise error.JsonRpcError(
            code=JsonRpcErrorCodes.BATCH_CLIENT_ERROR,
            message="Failed to upload files to file group",
            data={"original": str(valueError)})

    # just return this count to the user, can do something better later
    # TODO: keep track of uploading files in the callback below and remove
    # this code.
    uploadCount = 0
    for _, _, files in os.walk(directory.replace(SUBDIR_FILTER, "")):
        uploadCount += len(files)

    return {
        "uploaded": uploadCount,
    }


def __uploadCallback(param1, param2):
    """
        Callback from file upload. Anna is going to change to return filename as well.
    """
    # TODO: Create a dictionary and pass back upload progress to the caller.
    print("uploading {} of {} bytes".format(param1, param2))


def __getRequiredParameterError(parameter):
    return error.JsonRpcError(
        code=JsonRpcErrorCodes.INVALID_PARAMS,
        message=ERROR_REQUIRED_PARAM.format(parameter),
        data={"status": 400})
