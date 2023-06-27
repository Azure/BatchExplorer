FROM microsoft/windowsservercore:ltsc2016

ENV node_version=10.8.0

ENV PYTHON_VERSION 3.6.6
ENV PYTHON27_VERSION 2.7.15
ENV PYTHON_PIP_VERSION 9.0.1

ENV GIT_VERSION 2.17.1

LABEL Description="BatchLabs image for building for windows" Maintainer="batchexplorer@microsoft.com" Version="${node_version}"

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

# Install node
ADD https://nodejs.org/dist/v${node_version}/node-v${node_version}-win-x64.zip C:/build/node.zip
RUN Expand-Archive C:/build/node.zip C:/; Rename-Item C:/node-v$env:node_version-win-x64 node
RUN SETX PATH C:\node;$PATH

# Install python
RUN $url = ('https://www.python.org/ftp/python/{0}/python-{1}-amd64.exe' -f $env:PYTHON_VERSION, $env:PYTHON_VERSION); \
	Write-Host ('Downloading {0} ...' -f $url); \
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; \
	Invoke-WebRequest -Uri $url -OutFile 'python.exe'; \
	Write-Host 'Installing ...'; \
    # https://docs.python.org/3.5/using/windows.html#installing-without-ui
	Start-Process python.exe -Wait \
		-ArgumentList @( \
			'/quiet', \
			'InstallAllUsers=1', \
			'TargetDir=C:\Python', \
			'PrependPath=1', \
			'Shortcuts=0', \
			'Include_doc=0', \
			'Include_pip=1', \
			'Include_test=0' \
		); \
    # the installer updated PATH, so we should refresh our local value
	$env:PATH = [Environment]::GetEnvironmentVariable('PATH', [EnvironmentVariableTarget]::Machine); \
	Write-Host 'Verifying install ...'; \
	Write-Host '  python --version'; python --version; \
	Write-Host 'Removing ...'; \
	Remove-Item python.exe -Force; \
	Write-Host 'Complete.';



# Install python 27
RUN [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; \
    Invoke-WebRequest $('https://www.python.org/ftp/python/{0}/python-{0}.amd64-pdb.zip' -f $env:PYTHON27_VERSION) -OutFile 'python.zip' -UseBasicParsing ; \
    Expand-Archive python.zip -DestinationPath C:\python27 ; \
    Remove-Item -Path python.zip ;

# Install git
RUN [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; \
    Invoke-WebRequest $('https://github.com/git-for-windows/git/releases/download/v{0}.windows.1/MinGit-{0}-64-bit.zip' -f $env:GIT_VERSION) -OutFile MinGit.zip; \
    Expand-Archive c:\MinGit.zip -DestinationPath c:\MinGit; \
    $env:PATH = $env:PATH + ';C:\MinGit\cmd\;C:\MinGit\cmd'; \
    Set-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment' -Name Path -Value $env:PATH

CMD [ "powerhsell" ]
