param (
    [string]$artifactsPath = ""
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# If artifacts path is empty, then this script is run locally
# But if artifactsPath is set, then the script is run on the Azure DevOps path
if ($artifactsPath -eq "") {
    $rootDir = (Join-Path $scriptDir ".." -Resolve)
} else {
    $rootDir = $artifactsPath
}

$localizeFinalDir = Join-Path $rootDir "Localize/final"

Write-Host "The root directory is $rootDir"

# Check if Localize/final directory exists, if not create it
if (!(Test-Path -Path $localizeFinalDir)) {
    New-Item -ItemType Directory -Path $localizeFinalDir | Out-Null
}

# Define resource directories (absolute paths)
$resourceDirs = @(
    (Join-Path $rootDir "packages/common/resources/i18n/json"),
    (Join-Path $rootDir "packages/playground/resources/i18n/json"),
    (Join-Path $rootDir "packages/react/resources/i18n/json"),
    (Join-Path $rootDir "packages/service/resources/i18n/json")
)

# Check if all translation files are present
$allFilesExist = $true
foreach ($dir in $resourceDirs) {
    $fullDir = $dir
    $files = Get-ChildItem -Path $fullDir -Filter "resources.*.json"
    if ($files.Count -lt 1) {
        $allFilesExist = $false
        Write-Error "ERROR: No translation files found in directory $fullDir"
    }
}

if ($allFilesExist) {
    # Initialize an empty hashtable to store the merged translations
    $mergedTranslations = @{}

    # Iterate through each resource directory
    foreach ($dir in $resourceDirs) {
        $fullDir = $dir

        # Iterate through each JSON file in the directory
        foreach ($file in Get-ChildItem -Path $fullDir -Filter "resources.*.json") {
            $langID = $file.Name.Split(".")[1]

            # If the language ID is not in the hashtable, add it
            if (!$mergedTranslations.ContainsKey($langID)) {
                $mergedTranslations[$langID] = @{}
            }

            # Read the JSON content and convert it to a PowerShell object
            $content = Get-Content -Path $file.FullName -Raw | ConvertFrom-Json

            # Merge the content into the hashtable
            foreach ($key in $content.PSObject.Properties.Name) {
                $mergedTranslations[$langID][$key] = $content.$key
            }
        }
    }

    # Write the merged translations to the output directory
    foreach ($langID in $mergedTranslations.Keys) {
        $outputFile = Join-Path $localizeFinalDir "resources.$langID.json"
        # Sort keys alphabetically and create a new ordered dictionary
        $sortedTranslations = [ordered]@{}
        $mergedTranslations[$langID].Keys | Sort-Object | ForEach-Object { $sortedTranslations[$_] = $mergedTranslations[$langID][$_] }
        $sortedTranslations | ConvertTo-Json -Depth 100 | Set-Content -Path $outputFile
    }

    Write-Host "Merged translations have been saved in $localizeFinalDir"
}
else {
    Write-Error "ERROR: Not all translation files were found. Cannot merge translations."
}
