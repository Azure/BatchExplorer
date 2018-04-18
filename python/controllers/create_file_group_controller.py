import os
import asyncio
import logging
from typing import List

from server.app import app
from jsonrpc import JsonRpcErrorCodes, error, JsonRpcRequest

SUBDIR_FILTER = os.path.join('**', '*')

PARAM_PREFIX = "prefix"
PARAM_FULL_PATH = "fullPath"
PARAM_FLATTEN = "flatten"
PARAM_RECURSIVE = "recursive"
PARAM_ACCOUNT_NAME = "name"
PARAM_ACCOUNT_PROPERTIES = "properties"

PARAM_INDEX_BATCH_TOKEN = 0
PARAM_INDEX_ARM_TOKEN = 1
PARAM_INDEX_NAME = 2
PARAM_INDEX_DIRECTORY = 3
PARAM_INDEX_OPTIONS = 4
PARAM_INDEX_ACCOUNT = 5

ERROR_REQUIRED_PARAM = "{} is a required parameter"

@app.procedure("create-file-group")
async def create_file_group(request: JsonRpcRequest, name, directory, options):
    # Default these parameters as they are optional
    prefix, flatten, full_path, recursive = [None, False, False, False]
    if options:
        if options.get(PARAM_PREFIX):
            prefix = options.get(PARAM_PREFIX)

        if options.get(PARAM_FULL_PATH):
            full_path = options.get(PARAM_FULL_PATH)

        if options.get(PARAM_FLATTEN):
            flatten = options.get(PARAM_FLATTEN)

        if options.get(PARAM_RECURSIVE):
            recursive = options.get(PARAM_RECURSIVE)

    return await upload_files(request, name, [directory], full_path=full_path, flatten=flatten, root=prefix, merge=True, recursive=recursive)

async def upload_files(
        request: JsonRpcRequest,
        file_group_name: str,
        paths: List[str],
        full_path: bool=False,
        root=None,
        flatten=False,
        recursive=True,
        merge=False):

    total_files = count_files_in_paths(paths)
    uploaded_files = 0

    def __uploadCallback(current, file_size):
        """
            Callback from file upload.
        """
        nonlocal uploaded_files

        if current == 0:
            print("returning")
            return

        if current == file_size:
            uploaded_files += 1
            request.push_stream(dict(uploaded=uploaded_files, total=total_files))
            print("Complete uploads {0}/{1}".format(uploaded_files, total_files))
        else:
            # Files larger than 64MB trigger a block upload in storage client
            percent = round((current / file_size) * 100)
            request.push_stream(dict(uploaded=uploaded_files, total=total_files, partial=percent))
            print("Partial upload: {0}% of {1}".format(percent, file_size))

    for path in paths:
        remote_path = None
        local_path = path
        is_dir = os.path.isdir(path)
        # If fullPath is true, the the prefix becomes the directory path.
        # Any existing prefix is overwritten/ignored
        if full_path:
            remote_path = path
        elif not merge and is_dir:
            remote_path = os.path.join(root, os.path.basename(path))
        else:
            remote_path = root

        if recursive and is_dir:
            local_path = os.path.join(path, SUBDIR_FILTER)

        try:
            request.push_stream(dict(uploaded=0, total=total_files))
            request.auth.client.file.upload(
                local_path=local_path,
                file_group=file_group_name,
                remote_path=remote_path,
                flatten=flatten,
                progress_callback=__uploadCallback)

        except ValueError as valueError:
            logging.error("Failed to upload files to file group.", str(valueError))
            raise error.JsonRpcError(
                code=JsonRpcErrorCodes.BATCH_CLIENT_ERROR,
                message="Failed to upload files to file group",
                data=str(valueError))

    return dict(uploaded=uploaded_files, total=total_files)

def count_files_in_paths(paths: List[str]):
    total_files = 0
    for path in paths:
        if os.path.isfile(path):
            total_files += 1
            continue

        for _, _, files in os.walk(path):
            total_files += len(files)
    return total_files

def __getRequiredParameterError(parameter):
    return error.JsonRpcError(
        code=JsonRpcErrorCodes.INVALID_PARAMS,
        message=ERROR_REQUIRED_PARAM.format(parameter),
        data={"status": 400})
