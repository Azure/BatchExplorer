# build.ps1
$RepoRoot = (Resolve-Path "$PSScriptRoot\..").Path
$LocProject = Join-Path $PSScriptRoot "LocProject.json"
$LocalizationXLocPkgVer = "2.0.7"

$OutDir = Join-Path $PSScriptRoot "out"
$NUGET_PACKAGES = Join-Path $PSScriptRoot "packages"
$XLocPath = Join-Path $NUGET_PACKAGES "Localization.XLoc.$LocalizationXLocPkgVer"

# Uncomment and set the following variable if needed
# $LocCustomPowerShellScript = "{path to the script to customize localized files}"

Write-Host "Running Localization..."

# Set the RepoRoot and NUGET_PACKAGES environment variables
$env:RepoRoot = $RepoRoot
$env:NUGET_PACKAGES = $NUGET_PACKAGES

# Delete and re-create the output directory if it already exists
# The following code deletes and re-creates the Localize/out directory to ensure it is empty and ready to receive the
# generated localization files. This is necessary because if the directory already exists but is empty or partially empty,
# the script will not move any files into it, and the localization files will not be generated.
if (Test-Path -Path "$OutDir") {
    Remove-Item -Path "$OutDir" -Recurse -Force
}
New-Item -ItemType Directory -Path "$OutDir"

& "$XLocPath\tools\netfx\Microsoft.Localization.XLoc.exe" /f "$LocProject"
$localizationExitCode = $LASTEXITCODE

# Clear the RepoRoot and NUGET_PACKAGES environment variables
Remove-Item Env:\RepoRoot
Remove-Item Env:\NUGET_PACKAGES

# Move the generated files to the desired output directory
if ($localizationExitCode -eq 0) {
    Move-Item -Path "$RepoRoot\out\*" -Destination $OutDir -Force
    Remove-Item -Path "$RepoRoot\out" -Recurse -Force
}

Write-Host "Localization finished with exit code '$localizationExitCode'."
Exit $localizationExitCode
