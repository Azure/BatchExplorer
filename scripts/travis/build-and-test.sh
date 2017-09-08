#!/bin/bash
set -ev

echo "=======  Starting build-and-test.sh  ========================================"

# Go to project dir
cd $(dirname $0)/../..

if [[ $TRAVIS_OS_NAME == 'linux' ]]; then # Only run the CI checks on the linux build
    # Run the test
    npm run test -s

    # Run the lint
    npm run lint -s
fi

# Only run prod build if on a branch build or PR for stable
if [ "${TRAVIS_PULL_REQUEST}" = "false" ] || [ "${TRAVIS_BRANCH}" = "stable" ] || [ "${TRAVIS_BRANCH}" = "feature/publish"  ]; then
	npm run -s build:prod
    npm run -s build-python
    npm run package -- --publish always --draft # TODO remove this
    # npm run package -- --publish never # TODO replace with this
else
    if [[ $TRAVIS_OS_NAME == 'linux' ]]; then # Only run the CI checks on the linux build
        # Normal build
        npm run build -s
    fi
fi

# Only package if on stable branch
if [ "${TRAVIS_PULL_REQUEST}" = "false" ] && [ "${TRAVIS_BRANCH}" = "stable" ]; then
    npm run package -- --publish always --draft
fi
