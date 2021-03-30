import { ICachePlugin, TokenCacheContext } from "@azure/msal-node";

const TOKEN_CACHE_STORAGE_KEY = "MSALAccessToken";

export class MSALAccessTokenCache implements ICachePlugin {

    public async beforeCacheAccess(cacheContext: TokenCacheContext) {
        cacheContext.tokenCache.deserialize(localStorage.getItem(this._key()));
    }

    public async afterCacheAccess(cacheContext: TokenCacheContext) {
        if (cacheContext.cacheHasChanged) {
            localStorage.setItem(TOKEN_CACHE_STORAGE_KEY,
                cacheContext.tokenCache.serialize());
        }
    }

    private _key(): string {
        return `BatchExplorer-${TOKEN_CACHE_STORAGE_KEY}`;
    }
};
