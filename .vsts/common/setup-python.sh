#!/bin/bash

set -e

pyroot="$AGENT_WORKFOLDER/.venv/batchexplorer"
conf_file="$pyroot/pip.ini"

echo "Setting up Python virtual environment..."
python3 -m venv "$pyroot"
if [ "$AGENT_OS" == "Windows_NT" ]; then
    "$pyroot/Scripts/activate"
else
    source "$pyroot/bin/activate"
fi
echo "Path is $PATH"

echo "Upgrading pip..."
python3 -m pip install --upgrade pip
pip3 install keyring artifacts-keyring

echo "Configuring private feed..."
# If the target conf file doesn't exist, pip config creates one at the user dir.
# This doesn't matter all that much for build agents.
touch "$conf_file"
pip3 config set global.index-url https://azurebatch.pkgs.visualstudio.com/_packaging/BatchExplorer/pypi/simple/
pip3 config list
