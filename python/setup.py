import os
from cx_Freeze import setup, Executable

# Dependencies are automatically detected, but it might need fine tuning.
build_exe_options = {
    "packages": ["os", "asyncio"],
    "includes": ["controllers"],
    "excludes": ["tkinter"],
}

dir_path = os.path.dirname(os.path.realpath(__file__))
setup(
    name="blpythonrpc",
    version="0.1",
    description="BatchLabs Python rpc server",
    options={"build_exe": build_exe_options},
    executables=[Executable(os.path.join(dir_path, "main.py"))]
)
