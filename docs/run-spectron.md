# Run E2E test with spectron

[Spectron](https://github.com/electron/spectron) is a framework to control electron application to automate e2e testing. It allow us to test the bundled APP(Executable) is working just fine.

When to use spectron test vs unit test:

* Test things that cannot be tested with the unit test mocking APIs
* Test multi window interaction

## Prerequisite

* Set `SPECTRON_AAD_USER_EMAIL` with the user email
* Set `SPECTRON_AAD_USER_PASSWORD` with the user password

Build the executable

```bash
yarn build:package
```

## Run

```bash
yarn spectron

# To keep the windows open when the test are over(For debugging)
yarn spectron:keep
```

## Write tests

Spectron tests are in the `test/spectron` directory

## Issues with spectron

* Doesn't support using menus [#21](https://github.com/electron/spectron/issues/21)
