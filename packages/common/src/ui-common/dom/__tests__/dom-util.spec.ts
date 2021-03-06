import { initMockEnvironment } from "../../environment";
import { uniqueElementId } from "../dom-util";

describe("Common DOM utilities", () => {
    beforeEach(() => initMockEnvironment());

    test("uniqueElementId() function", () => {
        expect(uniqueElementId()).toBe("be-element-0");
        expect(uniqueElementId()).toBe("be-element-1");
        expect(uniqueElementId("foo")).toBe("be-foo-2");
        expect(uniqueElementId("bar")).toBe("be-bar-3");
    });
});
