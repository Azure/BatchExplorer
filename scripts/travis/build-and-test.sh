#!/bin/bash
set -ev

echo "=======  Starting build-and-test.sh  ========================================"

# Go to project dir
cd $(dirname $0)/../..

if [[ $TRAVIS_OS_NAME == 'linux' ]]; then # Only run the CI checks on the linux build
    # Run the test
    npm run test -s
    codecov

    # Run the lint
    npm run lint -s
fi

# Only run on a PR against stable or on stable branch
#if [ "${TRAVIS_BRANCH}" = "stable" ]; then
  # Check third party notices is up to date
  # npm run ts -s scripts/lca/generate-third-party -- --check
#fi
# TODO revert fix/publish to stable
if [ "${TRAVIS_PULL_REQUEST}" = "false" ] || [ "${TRAVIS_BRANCH}" = "stable" ]; then

    # Build for production
	npm run -s build:prod
    npm run -s build-python

    # Only package if on stable branch
    if [ "${TRAVIS_PULL_REQUEST}" = "false" ] && [ "${TRAVIS_BRANCH}" = "stable" ]; then
        if [[ $TRAVIS_OS_NAME == 'linux' ]]; then
            docker run --rm \
            --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR_|CSC_|_TOKEN|_KEY|AWS_|STRIP|BUILD_') \
            -v ${PWD}:/project \
            -v ~/.cache/electron:/root/.cache/electron \
            -v ~/.cache/electron-builder:/root/.cache/electron-builder \
            electronuserland/builder:wine \
            /bin/bash -c "yarn --link-duplicates --pure-lockfile && yarn package --linux --publish always --draft"
        else
            npm run package -- --publish always --draft
        fi
    else
        if [[ $TRAVIS_OS_NAME == 'linux' ]]; then
            docker run --rm \
            --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR_|CSC_|_TOKEN|_KEY|AWS_|STRIP|BUILD_') \
            -v ${PWD}:/project \
            -v ~/.cache/electron:/root/.cache/electron \
            -v ~/.cache/electron-builder:/root/.cache/electron-builder \
            electronuserland/builder:wine \
            /bin/bash -c "yarn --link-duplicates --pure-lockfile && yarn package --linux --publish never"
        else
            npm run package -- --publish never
        fi
    fi
    echo Artifacts generated:
    ls release
else
    if [[ $TRAVIS_OS_NAME == 'linux' ]]; then # Only run the CI checks on the linux build
        # Normal build
        npm run build -s
    fi
fi

