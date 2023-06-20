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

$packageNames = @("common", "service", "playground", "react", "web", "desktop")

# Get language directories
$languageDirs = Get-ChildItem -Path $sourceRoot -Directory

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

function Copy-Resources {
    param (
        [string]$packageName,
        [string]$languageDirFullName,
        [string]$languageId
    )

    if ($packageName -eq "web" -or $packageName -eq "desktop") {
        $sourcePath = Join-Path $languageDirFullName "$packageName/i18n/resources.resjson"
        if ($packageName -eq "web") {
            $targetDir = Join-Path $scriptDir "../$packageName/dev-server/resources/i18n"
        } else {
            $targetDir = Join-Path $scriptDir "../$packageName/resources/i18n"
        }
        $targetPath = Join-Path $targetDir "resources.$languageId.json"
    } else {
        $sourcePath = Join-Path $languageDirFullName "packages/$packageName/i18n/resources.resjson"
        $targetDir = Join-Path $scriptDir ".." -Resolve | Join-Path -ChildPath "packages/$packageName/resources/i18n/resjson"
        $targetPath = Join-Path $targetDir "resources.$languageId.resjson"
    }

    Write-Verbose "Checking $packageName source path: $sourcePath"
    if (Test-Path $sourcePath) {
        Write-Verbose "$packageName source path exists, preparing target directory"
        if (-not (Test-Path $targetDir)) {
            New-Item -ItemType Directory -Force -Path $targetDir > $null
        }

        Write-Verbose "Copying file from $sourcePath to $targetPath"
        Copy-Item -Path $sourcePath -Destination $targetPath

        if ($packageName -ne "web" -and $packageName -ne "desktop") {
            $jsonTargetDir = $targetDir.Replace("resjson", "json")
            $jsonTargetPath = Join-Path $jsonTargetDir "resources.$languageId.json"
            if (-not (Test-Path $jsonTargetDir)) {
                New-Item -ItemType Directory -Force -Path $jsonTargetDir > $null
            }
        } else {
            $jsonTargetPath = $targetPath
        }

        Write-Verbose "Converting $packageName resjson to json: $jsonTargetPath"
        Convert-ResjsonToJson -sourcePath $sourcePath -targetPath $jsonTargetPath
    }
}

Write-Host "Copying translation files"

foreach ($languageDir in $languageDirs) {
    $languageId = $languageDir.Name
    Write-Verbose "Processing language: $languageId"

    # Copy files to each of the package directories
    foreach ($packageName in $packageNames) {
        Copy-Resources -packageName $packageName -languageDirFullName $($languageDir.FullName) -languageId $languageId
    }
}
