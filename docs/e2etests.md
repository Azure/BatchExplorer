# Run end-to-end test with Playwright

[Playwright](https://playwright.dev) is a framework for web application end-to-end (e2e) testing.

When to use e2e tests vs unit tests:

* Test functionality that cannot be tested with the unit test mocking APIs
* Test multi window interaction

## Prerequisite

* Set `BE_TEST_AAD_USER_EMAIL` with the user email
* Set `BE_TEST_AAD_USER_PASSWORD` with the user password

Build the executable

```bash
npm run build-and-pack
```

## Run

```bash
npm run test-e2e

# Run Playwright in debug mode to step through tests
npm run test-e2e:debug
```

## Write tests

End-to-end tests are in the `test/e2e` directory

## Issues with Playwright

* Currently doesn't test the final built package, but rather the stock Electron executable.
