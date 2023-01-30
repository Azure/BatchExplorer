$version = $(npm pkg get version) -replace '"', ""

Write-Host "Updating build number to $version"
Write-Host "##vso[build.updatebuildnumber]$version"
