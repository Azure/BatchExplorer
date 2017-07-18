import azure.batch_extensions as batch

from azure.batch_extensions import models
from server.app import app

from os import listdir

@app.procedure("create_file_group")
def create_file_group(params):
    name = params[0]
    directory = params[1]
    accessPolicy = params[2]
    options = params[3]
    prefix, flatten, fullPath = ["", False, False]

    # Check input parameters
    print("create_file_group")
    print("name", name)
    print("directory", directory)
    print("accessPolicy", accessPolicy)

    if options: 
        if options.get("prefix"):
            prefix = options.get("prefix")
            print("options.prefix", prefix)

        if options.get("fullPath"):
            fullPath = options.get("fullPath")
            print("options.fullPath", fullPath)

        if options.get("flatten"):
            flatten = options.get("flatten")
            print("options.flatten", flatten)

    # TODO: validate input parameters, name and directory (required).
    # TODO: Throw error if not supplied.

    for file in listdir(directory):
        print("file: ", file)

    return {
        "name": name,
        "directory": directory,
        "accessPolicy": accessPolicy,
        "options": {
            "prefix": prefix,
            "fullPath": fullPath,
            "flatten": flatten,
        },
        "files" : [],
    }
