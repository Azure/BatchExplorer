import { versionsLooselyMatch } from "../util";

describe("util", () => {
    test("versionsLooselyMatch", () => {
        expect(versionsLooselyMatch("1.2.3", "1.2.3")).toBeTruthy();
        expect(versionsLooselyMatch("1.2.3", "^1.2.3-foo.9")).toBeTruthy();
        expect(versionsLooselyMatch("~1.2.3-foo.9", "1.2.3")).toBeTruthy();
        expect(versionsLooselyMatch("1.2.3", "^1.2.5-foo.9")).toBeFalsy();
        expect(versionsLooselyMatch("~1.2.5-foo.9", "1.2.3")).toBeFalsy();
    });
});
