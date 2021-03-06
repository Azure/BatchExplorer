#!/bin/bash
set -ev

echo "=======  Starting build-and-test.sh  ========================================"

# Go to project dir
cd $(dirname $0)/../..

# Run the test
yarn test -s

# Run the lint
yarn lint -s

# Only run on a PR against stable or on stable branch
#if [ "${TRAVIS_BRANCH}" = "stable" ]; then
  # Check third party notices is up to date
  # yarn ts -s scripts/lca/generate-third-party -- --check
#fi
if [ "${TRAVIS_PULL_REQUEST}" = "false" ] || [ "${TRAVIS_BRANCH}" = "stable" ]; then
    # Build for production
	yarn build:prod
    yarn build-python
else
    if [[ $TRAVIS_OS_NAME == 'linux' ]]; then # Only run the CI checks on the linux build
        # Normal build
        yarn build -s
    fi
fi

