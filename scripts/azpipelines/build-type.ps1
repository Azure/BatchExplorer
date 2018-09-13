param (
    $branch
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

# TODO-TIM revert
If ($branch -like "refs/heads/feature/signing-vsts") {
    $buildType="testing"
}

Write-Host "Build type is $buildType"
Write-Host "##vso[build.addbuildtag]$buildType"
Write-Host "##vso[task.setvariable variable=BUILD_TYPE]$buildType"
