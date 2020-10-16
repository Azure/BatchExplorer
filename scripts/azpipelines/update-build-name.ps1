$version = npm run -s ts "scripts/package/get-version.ts"

Write-Host "Updating build number to $version"
Write-Host "##vso[build.updatebuildnumber]$version"
