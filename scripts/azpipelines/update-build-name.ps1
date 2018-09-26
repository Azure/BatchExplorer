$version = npm run -s ts "scripts/package/get-version.ts"

Write-Host "Version is $version"
Write-Host "##vso[build.updatebuildnumber]$version"
