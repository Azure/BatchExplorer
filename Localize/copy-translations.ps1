param (
    [string]$artifactsPath = ""
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

if ($artifactsPath -eq "") {
    $sourceRoot = Join-Path $scriptDir "out/loc"
} else {
    $sourceRoot = $artifactsPath
}

$packageNames = @("common", "service", "playground", "react")

# Get language directories
$languageDirs = Get-ChildItem -Path $sourceRoot -Directory

foreach ($languageDir in $languageDirs) {
    $languageId = $languageDir.Name
    Write-Host "Processing language: $languageId"

    # Process package directories
    foreach ($packageName in $packageNames) {
        $sourcePath = Join-Path $($languageDir.FullName) "packages/$packageName/i18n/resources.resjson"
        $targetDir = (Join-Path $scriptDir ".." -Resolve) | Join-Path -ChildPath "packages/$packageName/resources/i18n"
        $targetPath = Join-Path $targetDir "resources.$languageId.resjson"

        Write-Host "Checking source path: $sourcePath"
        if (Test-Path $sourcePath) {
            Write-Host "Source path exists, preparing target directory"
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Force -Path $targetDir
            }

            Write-Host "Copying file from $sourcePath to $targetPath"
            Copy-Item -Path $sourcePath -Destination $targetPath
        }
    }

    # Handle the desktop directory exception
    $desktopSource = Join-Path $($languageDir.FullName) "desktop/i18n/resources.resjson"
    $desktopTargetDir = (Join-Path $scriptDir "../desktop/resources/i18n")
    $desktopTarget = Join-Path $desktopTargetDir "resources.$languageId.resjson"

    Write-Host "Checking desktop source path: $desktopSource"
    if (Test-Path $desktopSource) {
        Write-Host "Desktop source path exists, preparing target directory"
        if (-not (Test-Path $desktopTargetDir)) {
            New-Item -ItemType Directory -Force -Path $desktopTargetDir
        }

        Write-Host "Copying file from $desktopSource to $desktopTarget"
        Copy-Item -Path $desktopSource -Destination $desktopTarget
    }
}
