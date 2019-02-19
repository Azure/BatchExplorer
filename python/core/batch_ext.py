import os
import sys

EXT_PATH_ENV = "BATCH_EXLORER_AZ_BATCH_EXT_PATH"


def init():
    """
    This checks if there is a custom configuration for loading azext and setup the python path accrodingly
    """
    if EXT_PATH_ENV in os.environ:
        path = os.environ[EXT_PATH_ENV]

        if os.path.isdir(path) and os.path.isdir(os.path.join(path, "azext")):
            print("{} provided stub path for the azure batch extension. It will load from {}".format(
                EXT_PATH_ENV, path))
            if "azext" in sys.modules:    # If azext is already there because its a namspace package we clear it
                del sys.modules["azext"]
            sys.path.insert(0, os.path.join(path))
        else:
            print("{} is not a valid path for azext {}".format(EXT_PATH_ENV, path))
