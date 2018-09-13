# This compute the build type for VSTS build
$buildType="dev"
Write-Host "Branch is $env:BUILD_SOURCEBRANCH"

If ("$env:BUILD_SOURCEBRANCH" -like "refs/heads/master") {
    $buildType="insider"
}

If ("$env:BUILD_SOURCEBRANCH" -like "refs/heads/stable") {
    $buildType="stable"
}

# TODO-TIM revert
If ("$env:BUILD_SOURCEBRANCH" -like "refs/heads/feature/signing-vsts") {
    $buildType="testing"
}

Write-Host "Build type is $buildType"
Write-Host "##vso[build.addbuildtag]$buildType"
Write-Host "##vso[task.setvariable variable=BUILD_TYPE]$buildType"
