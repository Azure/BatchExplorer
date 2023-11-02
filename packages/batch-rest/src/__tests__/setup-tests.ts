import { destroyEnvironment } from "@azure/bonito-core";

afterEach(() => {
    jest.resetAllMocks();
    destroyEnvironment();
});

afterAll(() => {
    jest.restoreAllMocks();
});
