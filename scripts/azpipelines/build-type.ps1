# This compute the build type for VSTS build
$buildType="dev"
Write-Host "Branch is $(Build.SourceBranch)"

If ("$(Build.SourceBranch)" -like "refs/heads/master") {
$buildType="insider"
}

If ("$(Build.SourceBranch)" -like "refs/heads/stable") {
$buildType="stable"
}

Write-Host "Build type is $buildType"
Write-Host "##vso[build.addbuildtag]$buildType"
Write-Host "##vso[task.setvariable variable=BUILD_TYPE]$buildType"
