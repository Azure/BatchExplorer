# Sets build variables for use in various build stages

param (
    $branch,
    $buildNumber
)
# This compute the build type for VSTS build
$buildType = "dev"
$distTag = "latest"

Write-Host "Branch is $branch"

If ($branch -like "refs/heads/master") {
    $buildType = "insider"
    $distTag = "latest"
}

If ($branch -like "refs/heads/stable") {
    $buildType = "stable"
    $distTag = "stable"
}

If ($branch -like "refs/heads/vnext") {
    $buildType = "vnext"
    $distTag = "next"
}

# TEMPORARY (2023-02-09): This is to support the transition from vnext to main.
# Eventually, the distribution pipeline on the main branch will create:
#
# - A BatchExplorer insider build (buildType = "insider")
# - NPM packages with the latest tag (distTag = "latest")
#
# In the next phase, the `vnext` branch will be removed and the above condition
# can be removed as well. In a subsequent phase, the `master` branch will be
# deprecated, at which point the `master` condition above will also be removed.
If ($branch -like "refs/heads/main") {
    $buildType = "vnext"
    $distTag = "next"
}

If ($branch -like "refs/heads/hoppe/update-v1") {
    $buildType = "hoppe-update-v1"
    $distTag = "hoppe-update-v1"
}

# Change to curent branch for testing
If ($branch -like "refs/heads/feature/signing-vsts") {
    $buildType = "testing"
}

Write-Host "Build type is $buildType"
Write-Host "##vso[build.addbuildtag]$buildType"
Write-Host "##vso[task.setvariable variable=BUILD_TYPE]$buildType"

Write-Host "Setting publication distribution tag to $distTag"
Write-Host "##vso[task.setvariable variable=DIST_TAG]$distTag"

# Hyphens in the version causes RPM packaging to fail
# See https://azurebatch.visualstudio.com/BatchExplorer/_workitems/edit/379
$newBuildNumber = $buildNumber -replace '-', '_'
Write-Host "Setting build number to $newBuildNumber"
Write-Host "##vso[build.updatebuildnumber]$newBuildNumber"
