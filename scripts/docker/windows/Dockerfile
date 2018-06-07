FROM microsoft/nanoserver

ENV node_version=10.4.0

ENV PYTHON_VERSION 3.6.5
ENV PYTHON_PIP_VERSION 9.0.1

ENV GIT_VERSION 2.17.1

LABEL Description="BatchLabs image for building for windows" Maintainer="tiguerin@microsoft.com" Version="${node_version}"

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

# Install node
ADD https://nodejs.org/dist/v${node_version}/node-v${node_version}-win-x64.zip C:/build/node.zip
RUN Expand-Archive C:/build/node.zip C:/; Rename-Item C:/node-v$env:node_version-win-x64 node
RUN SETX PATH C:\node;$PATH

# Install python
RUN Invoke-WebRequest $('https://www.python.org/ftp/python/{0}/python-{0}-embed-amd64.zip' -f $env:PYTHON_VERSION) -OutFile 'python.zip' -UseBasicParsing ; \
    Expand-Archive python.zip -DestinationPath C:\python ; \
    $env:PATH = 'C:\python;C:\python\Scripts;{0}' -f $env:PATH ; \
    Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment' -Name Path -Value $env:PATH ; \
    Remove-Item -Path python.zip ; \
    mkdir $env:APPDATA\Python\Python36\site-packages ; \
    Invoke-WebRequest 'https://bootstrap.pypa.io/get-pip.py' -OutFile 'get-pip.py' -UseBasicParsing ; \
    $replace = ('import tempfile{0}import site{0}site.getusersitepackages()' -f [char][int]10) ; \
    Get-Content get-pip.py | Foreach-Object { $_ -replace 'import tempfile', $replace } | Out-File -Encoding Ascii getpip.py ; \
    $pipInstall = ('pip=={0}' -f $env:PYTHON_PIP_VERSION) ; \
    python getpip.py $pipInstall ; \
    Remove-Item get-pip.py ; \
    Remove-Item getpip.py

# Install git
RUN Invoke-WebRequest $('https://github.com/git-for-windows/git/releases/download/v{0}.windows.1/MinGit-{0}-64-bit.zip' -f $env:GIT_VERSION) -OutFile MinGit.zip
RUN Expand-Archive c:\MinGit.zip -DestinationPath c:\MinGit; \
$env:PATH = $env:PATH + ';C:\MinGit\cmd\;C:\MinGit\cmd'; \
Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment' -Name Path -Value $env:PATH

CMD [ "powerhsell" ]
