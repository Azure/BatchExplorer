import MSALCachePlugin from "./msal-cache-plugin";

describe("MSALCachePlugin", () => {
    let plugin, cacheContextSpy;
    const storeSpy = jasmine.createSpyObj("DataStore", {
        setItem: jasmine.anything(),
        getItem: "deserializedValue"
    });
    const cacheSpy = jasmine.createSpyObj("Cache", {
        serialize: "serializedValue",
        deserialize: jasmine.anything()
    });
    beforeEach(() => {
        plugin = new MSALCachePlugin(storeSpy);
        cacheContextSpy = {
            tokenCache: cacheSpy,
            cacheHasChanged: false
        };
    })
    it("should get an item before the cache is called", async () => {
        expect(storeSpy.getItem).not.toHaveBeenCalled();
        await plugin.beforeCacheAccess(cacheContextSpy);
        expect(storeSpy.getItem).toHaveBeenCalled();
        expect(cacheSpy.deserialize).toHaveBeenCalledWith("deserializedValue");
    });
    it("should store an item after the cache is called", async () => {
        expect(storeSpy.setItem).not.toHaveBeenCalled();

        await plugin.afterCacheAccess(cacheContextSpy);
        expect(storeSpy.setItem).not.toHaveBeenCalled();

        cacheContextSpy.cacheHasChanged = true;
        await plugin.afterCacheAccess(cacheContextSpy);
        expect(storeSpy.setItem).toHaveBeenCalledWith(
            jasmine.anything(),
            "serializedValue"
        );
    });
});
