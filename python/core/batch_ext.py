import os
import sys


def init():
    os.environ[
        "BATCH_EXLORER_AZ_BATCH_EXT_PATH"] = "D:/dev/BatchExplorer/azure-batch-cli-extensions"

    if "BATCH_EXLORER_AZ_BATCH_EXT_PATH" in os.environ:
        del sys.modules["azext"]
        path = os.environ["BATCH_EXLORER_AZ_BATCH_EXT_PATH"]

        if os.path.isdir(path) and os.path.isdir(os.path.join(path, "azext")):
            print(
                "BATCH_EXLORER_AZ_BATCH_EXT_PATH provided stub path for the azure batch extension. It will load from {}".
                format(path))
            sys.path.insert(0, os.path.join(path))
        else:
            print(
                "BATCH_EXLORER_AZ_BATCH_EXT_PATH is not a valid path for azext {0}".
                format(path))
