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

# Only run on a PR against stable or on stable branch
if [ "${TRAVIS_BRANCH}" = "stable" ]; then
  # Check third party notices is up to date
  npm run ts -s scripts/lca/generate-third-party -- --check
fi
# TODO revert fix/publish to stable
if [ "${TRAVIS_PULL_REQUEST}" = "false" ] || [ "${TRAVIS_BRANCH}" = "fix/publish" ]; then

    # Build for production
	npm run -s build:prod
    npm run -s build-python
        
    # Only package if on stable branch
    if [ "${TRAVIS_PULL_REQUEST}" = "false" ] && [ "${TRAVIS_BRANCH}" = "fix/publish" ]; then
        npm run package -- --publish always
    else 
        npm run package -- --publish never --draft # TODO replace with this
    fi
    ls release
else
    if [[ $TRAVIS_OS_NAME == 'linux' ]]; then # Only run the CI checks on the linux build
        # Normal build
        npm run build -s
    fi
fi

