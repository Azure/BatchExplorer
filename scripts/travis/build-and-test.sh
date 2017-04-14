#!/bin/bash
set -ev

echo "=======  Starting build-and-test.sh  ========================================"

# Go to project dir
cd $(dirname $0)/../..

# Normal build
# npm run build -s

if [ "${TRAVIS_PULL_REQUEST}" = "false" ] || [ "${TRAVIS_BRANCH}" = "master" ]; then
	npm run build:prod
fi

# Run the test
# npm run test -s

# Run the lint
npm run lint -s
