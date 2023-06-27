Param(
    [Parameter(
        Mandatory = $true,
        HelpMessage = "Enter the proxy server's IP address"
    )][Alias("Address")][string]
    $ProxyIpAddress,
    [Parameter(
        Mandatory = $true,
        HelpMessage = "Enter the proxy server's port"
    )][Alias("Port")][string]
    $ProxyPort,
    [Parameter(
        HelpMessage = "Enter the Batch Explorer build string (e.g., 2.14.0-insider.602)",
        Mandatory = $true
    )][Alias("Build")][string]
    $BatchExplorerBuild
)

function Get-Proxy () {
    Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' | Select-Object ProxyServer, ProxyEnable
}

function Set-Proxy {
    [CmdletBinding()]
    [Alias('proxy')]
    [OutputType([string])]
    Param
    (
        # server address
        [Parameter(
            Mandatory = $true,
            ValueFromPipelineByPropertyName = $true,
            Position = 0
        )]
        $server,
        # port number
        [Parameter(
            Mandatory = $true,
            ValueFromPipelineByPropertyName = $true,
            Position = 1
        )]
        $port,
        [Parameter(
            ValueFromPipelineByPropertyName = $true
        )][switch]
        $test
    )
    If ($test) {
        #Test if the TCP Port on the server is open before applying the settings
        If ((Test-NetConnection -ComputerName $server -Port $port).TcpTestSucceeded) {
            Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -name ProxyServer -Value "$($server):$($port)"
            Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -name ProxyEnable -Value 1
            Get-Proxy #Show the configuration
        }
        Else {
            Write-Error -Message "The proxy address is not valid: $($server):$($port)"
        }
    }
    Else {
        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -name ProxyServer -Value "$($server):$($port)"
        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -name ProxyEnable -Value 1
    }
}

function Remove-Proxy () {
    Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -name ProxyServer -Value ""
    Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -name ProxyEnable -Value 0
}

$PSDefaultParameterValues = @{"Set-Proxy:Test" = $true }

$BuildType = If ($BatchExplorerBuild.Contains("insider")) { "insider" } Else { "stable" }

$Uri = "https://batchexplorer.azureedge.net/$($BuildType)/$($BatchExplorerBuild)/BatchExplorer%20Setup%20$($BatchExplorerBuild).exe"

Invoke-WebRequest -Uri $Uri -OutFile BatchExplorer-Setup.exe

# Run Batch Explorer Setup
./BatchExplorer-Setup.exe

proxy $ProxyIpAddress $ProxyPort
