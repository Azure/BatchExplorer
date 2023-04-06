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

# If this script is run locally, in addition to the resjson files, it adds a json directory containing json files for local development
# If script is run on ADO, it only adds the resjson files used in production

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

Write-Host "Copying translation files"

foreach ($languageDir in $languageDirs) {
    $languageId = $languageDir.Name
    Write-Verbose "Processing language: $languageId"

    # Process package directories
    foreach ($packageName in $packageNames) {
        $sourcePath = Join-Path $($languageDir.FullName) "packages/$packageName/i18n/resources.resjson"
        $targetDir = (Join-Path $scriptDir ".." -Resolve) | Join-Path -ChildPath "packages/$packageName/resources/i18n/resjson"
        $targetPath = Join-Path $targetDir "resources.$languageId.resjson"

        Write-Verbose "Checking source path: $sourcePath"
        if (Test-Path $sourcePath) {
            Write-Verbose "Source path exists, preparing target directory"
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Force -Path $targetDir
            }

            Write-Verbose "Copying file from $sourcePath to $targetPath"
            Copy-Item -Path $sourcePath -Destination $targetPath

            $jsonTargetDir = $targetDir.Replace("resjson", "json")
            $jsonTargetPath = $targetPath.Replace("resjson", "json")

            if (-not (Test-Path $jsonTargetDir)) {
                New-Item -ItemType Directory -Force -Path $jsonTargetDir
            }

            Write-Verbose "Converting resjson to json: $jsonTargetPath"
            Convert-ResjsonToJson -sourcePath $sourcePath -targetPath $jsonTargetPath
        }
    }

    # Handle the desktop directory exception
    $desktopSource = Join-Path $($languageDir.FullName) "desktop/i18n/resources.resjson"
    $desktopTargetDir = (Join-Path $scriptDir "../desktop/resources/i18n/resjson")
    $desktopTarget = Join-Path $desktopTargetDir "resources.$languageId.resjson"

    Write-Verbose "Checking desktop source path: $desktopSource"
    if (Test-Path $desktopSource) {
        Write-Verbose "Desktop source path exists, preparing target directory"
        if (-not (Test-Path $desktopTargetDir)) {
            New-Item -ItemType Directory -Force -Path $desktopTargetDir
        }

        Write-Verbose "Copying file from $desktopSource to $desktopTarget"
        Copy-Item -Path $desktopSource -Destination $desktopTarget

        $jsonDesktopTargetDir = $desktopTargetDir.Replace("resjson", "json")
        $jsonDesktopTarget = $desktopTarget.Replace("resjson", "json")

        if (-not (Test-Path $jsonDesktopTargetDir)) {
            New-Item -ItemType Directory -Force -Path $jsonDesktopTargetDir
        }

        Write-Verbose "Converting desktop resjson to json: $jsonDesktopTarget"
        Convert-ResjsonToJson -sourcePath $desktopSource -targetPath $jsonDesktopTarget
    }
}
