import { destroyEnvironment } from "../environment";
import { mockNodeTestMissingAPIs } from "../test-util/test-mocks";

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
