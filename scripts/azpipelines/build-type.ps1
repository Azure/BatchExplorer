param (
    $branch,
    $buildNumber
)
# This compute the build type for VSTS build
$buildType="dev"

Write-Host "Branch is $branch"

If ($branch -like "refs/heads/master") {
    $buildType="insider"
}

If ($branch -like "refs/heads/stable") {
    $buildType="stable"
}

# Change to curent branch for testing
If ($branch -like "refs/heads/feature/signing-vsts") {
    $buildType="testing"
}

Write-Host "Build type is $buildType"
Write-Host "##vso[build.addbuildtag]$buildType"
Write-Host "##vso[task.setvariable variable=BUILD_TYPE]$buildType"

# Hyphens in the version causes RPM packaging to fail
# See https://azurebatch.visualstudio.com/BatchExplorer/_workitems/edit/379
$newBuildNumber=$buildNumber -replace '-', '_'
Write-Host "Setting build number to $newBuildNumber"
Write-Host "##vso[build.updatebuildnumber]$newBuildNumber"
