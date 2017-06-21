import os
from cx_Freeze import setup, Executable

dir_path = os.path.dirname(os.path.realpath(__file__))

# Dependencies are automatically detected, but it might need fine tuning.
build_exe_options = {
    "build_exe": os.path.join(dir_path, "build"),
    "packages": ["os", "asyncio"],
    "include_files": [(os.path.join(dir_path, "controllers/"), "controllers/")],
    "excludes": ["tkinter"],
}

setup(
    name="blpythonrpc",
    version="0.1",
    description="BatchLabs Python rpc server",
    options={"build_exe": build_exe_options},
    executables=[Executable(os.path.join(dir_path, "main.py"))]
)
