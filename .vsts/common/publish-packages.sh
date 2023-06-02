#!/bin/bash

set -e

branch=$1
if [ -z $1 ]; then
    echo "Failed to publish package: No branch name supplied"
    exit 1
fi

package_name=$2
if [ -z $package_name ]; then
    echo "Failed to publish package: No package name supplied"
    exit 1
fi

ver=$(npm pkg get version | sed 's/"//g')
package_version=$(echo "$ver-$DIST_TAG.$BUILD_BUILDNUMBER" | sed 's/_//g')

echo "Publishing package $package_name@$package_version"
echo "=================================="
echo "Working dir: $PWD"
echo "Branch: $branch"
echo "=================================="

# Publish only from the main branch for now so that we don't have to worry
# about version bumping after releases from different branches.
if [ "$branch" = "refs/heads/main" ]; then
    npm version --no-git-tag-version $package_version
    npm publish --tag $DIST_TAG
else
    echo "Skipped publishing $package_name@$package_version: Packages are only published from the main branch."
fi
