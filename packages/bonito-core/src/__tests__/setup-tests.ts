import { destroyEnvironment } from "../environment";
import { mockNodeTestMissingAPIs } from "../test-util";

beforeAll(() => {
    mockNodeTestMissingAPIs();
});

afterEach(() => {
    jest.resetAllMocks();
    destroyEnvironment();
});

afterAll(() => {
    jest.restoreAllMocks();
});
