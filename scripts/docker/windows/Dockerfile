FROM microsoft/nanoserver

ENV node_version=10.4.0

LABEL Description="BatchLabs image for building for windows" Maintainer="tiguerin@microsoft.com" Version="${node_version}"

# Install node
ADD https://nodejs.org/dist/v${node_version}/node-v${node_version}-win-x64.zip C:/build/node.zip
RUN powershell -Command Expand-Archive C:/build/node.zip C:/; Rename-Item C:/node-v$env:node_version-win-x64 node
RUN SETX PATH C:\node;$PATH

CMD [ "powerhsell" ]
