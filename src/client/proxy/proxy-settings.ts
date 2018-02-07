import { BatchLabsApplication } from "client/core";
import { getAndTestProxySettings } from "get-proxy-settings";

export async function retrieveProxyCredentials(batchLabsApp: BatchLabsApplication) {
    return batchLabsApp.askUserForProxyCredentials();
}
export async function loadProxySettings(batchLabsApp: BatchLabsApplication) {
    return getAndTestProxySettings(async () => {
        return retrieveProxyCredentials(batchLabsApp).then(x=> {
            return x;
        });
    });
}
