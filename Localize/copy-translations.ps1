param (
    [string]$artifactsPath = ""
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# If artifacts path is empty, then this script is run locally
# But if artifactsPath is set, then the script is run on the Azure DevOps path
if ($artifactsPath -eq "") {
    $sourceRoot = Join-Path $scriptDir "out/loc"
} else {
    $sourceRoot = $artifactsPath
}

$packageNames = @("common", "service", "playground", "react")

# Get language directories
$languageDirs = Get-ChildItem -Path $sourceRoot -Directory

# Add JSON and RESJSON files

# Strip out resjson comments and resjson-specific formatting before writing the result to json file
function Convert-ResjsonToJson {
    param (
        [string]$sourcePath,
        [string]$targetPath
    )

    $content = Get-Content -Path $sourcePath -Raw

    $strippedContent = $content -replace '//.*$' -replace '/\*[\s\S]*?\*/' -replace ',\s*}' -replace ',\s*]'
    $parsedContent = $strippedContent | ConvertFrom-Json
    $cleanContent = New-Object -TypeName PSObject

    foreach ($key in $parsedContent.PSObject.Properties.Name) {
        if (-not $key.StartsWith("_")) {
            $cleanContent | Add-Member -MemberType NoteProperty -Name $key -Value $parsedContent.$key
        }
    }

    $cleanedJsonContent = $cleanContent | ConvertTo-Json -Depth 100
    Set-Content -Path $targetPath -Value $cleanedJsonContent
}

# Function to handle directory exceptions for web and desktop
function Resolve-DirectoryException {
    param (
        [string]$directoryName,
        [string]$languageDirFullName,
        [string]$languageId
    )

    $source = Join-Path $languageDirFullName "$directoryName/i18n/resources.resjson"

    if ($directoryName -eq "web") {
        $targetDir = (Join-Path $scriptDir "../$directoryName/dev-server/resources/i18n")
    } else {
        $targetDir = (Join-Path $scriptDir "../$directoryName/resources/i18n")
    }

    $target = Join-Path $targetDir "resources.$languageId.json"

    Write-Verbose "Checking $directoryName source path: $source"
    if (Test-Path $source) {
        Write-Verbose "$directoryName source path exists, preparing target directory"
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Force -Path $targetDir > $null
        }

        if ($directoryName -ne "web") {
            Write-Verbose "Copying file from $source to $target"
            Copy-Item -Path $source -Destination $target
        }

        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Force -Path $targetDir > $null
        }

        Write-Verbose "Converting $directoryName resjson to json: $target"
        Convert-ResjsonToJson -sourcePath $source -targetPath $target
    }
}

Write-Host "Copying translation files"

foreach ($languageDir in $languageDirs) {
    $languageId = $languageDir.Name
    Write-Verbose "Processing language: $languageId"

    # Copy files to each of the package directories
    foreach ($packageName in $packageNames) {
        $sourcePath = Join-Path $($languageDir.FullName) "packages/$packageName/i18n/resources.resjson"
        $targetDir = (Join-Path $scriptDir ".." -Resolve) | Join-Path -ChildPath "packages/$packageName/resources/i18n/resjson"
        $targetPath = Join-Path $targetDir "resources.$languageId.resjson"

        Write-Verbose "Checking source path: $sourcePath"
        if (Test-Path $sourcePath) {
            Write-Verbose "Source path exists, preparing target directory"
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Force -Path $targetDir > $null
            }

            Write-Verbose "Copying file from $sourcePath to $targetPath"
            Copy-Item -Path $sourcePath -Destination $targetPath

            $jsonTargetDir = $targetDir.Replace("resjson", "json")
            $jsonTargetPath = $targetPath.Replace("resjson", "json")

            if (-not (Test-Path $jsonTargetDir)) {
                New-Item -ItemType Directory -Force -Path $jsonTargetDir > $null
            }

            Write-Verbose "Converting resjson to json: $jsonTargetPath"
            Convert-ResjsonToJson -sourcePath $sourcePath -targetPath $jsonTargetPath
        }
    }

    # Copy files to the desktop directory
    Resolve-DirectoryException -directoryName "desktop" -languageDirFullName $($languageDir.FullName) -languageId $languageId

    # Copy files to the web directory
    Resolve-DirectoryException -directoryName "web" -languageDirFullName $($languageDir.FullName) -languageId $languageId

}
