import os
import sys


def init():
    os.environ[
        "BATCH_EXLORER_AZ_BATCH_EXT_PATH"] = "D:/dev/BatchExplorer/azure-batch-cli-extensions"

    if "BATCH_EXLORER_AZ_BATCH_EXT_PATH" in os.environ:
        print(sys.modules)
        del sys.modules["azext"]
        os.environ["PYTHONPATH"] = os.path.join(
            os.environ["BATCH_EXLORER_AZ_BATCH_EXT_PATH"])
        sys.path.insert(
            0, os.path.join(os.environ["BATCH_EXLORER_AZ_BATCH_EXT_PATH"]))

        print("SYS", sys.path)
        print("Az", __import__("azext").__path__)
