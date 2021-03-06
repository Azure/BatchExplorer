# Test in Batch Explorer

## Test the browser code(99% of the code should be there)

Start the browser test watch

```shell
cd desktop
yarn test-app-watch
```

This will now run the test whenever a change is made to the browser code or the test.

If you want to focus on a test/module you can add a `f` in front of `describe` or `it` to only run this section/test. For example:

```typescript
describe("MyModuleA", () => {
  it("succeed", () => expect(true).toBe(true));
});

// Only this module will run
fdescribe("MyModuleB", () => {
  it("fail", () => expect(true).toBe(false));
});
```

**Note: ESLint will scan for `fdescribe` and `fit` so you don't forget one when creating a PR**

## Test the client

You should not really have to run those unless changing some client code. CI will catch any error it throws anyway.

```bash
cd desktop

# For just running once to check
yarn test-client

# For working on test
yarn test-client-watch
```

## Summary

| Description                              | Single run             | Watch                        |
|------------------------------------------|------------------------|------------------------------|
| Run the test for the browser environment | `yarn test-app`        | `yarn test-app-watch`        |
| Run the test for the node environemnt    | `yarn test-client`     | `yarn test-client-watch`     |
| Run all the tests                        | `yarn test`            |                              |
| Run the lint                             | `yarn lint`            |                              |
