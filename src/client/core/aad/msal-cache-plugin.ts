import { ICachePlugin, TokenCacheContext } from "@azure/msal-node";
import { SecureDataStore } from "../secure-data-store";

const CACHE_KEY = "msal_auth_cache";

export default class MSALCachePlugin implements ICachePlugin {
    constructor(private store: SecureDataStore) {}

    public async beforeCacheAccess(context: TokenCacheContext): Promise<void> {
        context.tokenCache.deserialize(await this.store.getItem(CACHE_KEY));
    }

    public async afterCacheAccess(context: TokenCacheContext): Promise<void> {
        if (context.cacheHasChanged) {
            await this.store.setItem(CACHE_KEY, context.tokenCache.serialize());
        }
    }
}
