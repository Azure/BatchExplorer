import { getEnvironment, initMockEnvironment } from "../../environment";
import { getNormalizedBasePath, normalizeUrl } from "../url";

describe("URL utility functions", () => {
    beforeEach(() => initMockEnvironment());

    test("getNormalizedBasePath() function", () => {
        expect(getNormalizedBasePath()).toEqual("/");
        getEnvironment().config.basePath = "a/";
        expect(getNormalizedBasePath()).toEqual("/a/");
        getEnvironment().config.basePath = "/a/b";
        expect(getNormalizedBasePath()).toEqual("/a/b/");
    });

    test("normalizeUrl() function", () => {
        // Relative URLs include leading slashes
        expect(normalizeUrl("a")).toEqual("/a");
        getEnvironment().config.basePath = "a/b";
        expect(normalizeUrl("hello")).toEqual("/a/b/hello");
        expect(normalizeUrl("/hello")).toEqual("/a/b/hello");
        expect(normalizeUrl("/hello?param1=value1&param2=value2")).toEqual(
            "/a/b/hello?param1=value1&param2=value2"
        );

        // External URLs are left untouched
        expect(normalizeUrl("https://contoso.net/a/b/c")).toEqual(
            "https://contoso.net/a/b/c"
        );
        expect(normalizeUrl("http://contoso.net/a/b/c")).toEqual(
            "http://contoso.net/a/b/c"
        );
    });
});
