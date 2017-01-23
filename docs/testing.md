# Test in batch labs

## Test the browser code(99% of the code should be there)

Start the browser test watch
```
npm run test-browser-watch
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

**Note: TSLint will scan for `fdescribe` and `fit` so you don't forget one when creating a PR**

## Test the client
You should not really have to run those unless changing some client code. CI will catch any error it throws anyway.
```bash
# For just running once to check
npm run test-client

# For working on test
npm run test-client-watch
```
