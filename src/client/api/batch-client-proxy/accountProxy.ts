import { ListProxy, wrapOptions } from "./shared";

export default class AccountProxy {
    constructor(private client: any) {
    }

    /**
     * Lists all node agent SKUs supported by the Azure Batch service.
     * http://azure.github.io/azure-sdk-for-node/azure-batch/latest/Account.html#listNodeAgentSkus
     * @param options: Optional Parameters.
     */
    public listNodeAgentSkus(options?: any) {
        const entity = {
            list: this.client.account.listNodeAgentSkus.bind(this.client.account),
            listNext: this.client.account.listNodeAgentSkusNext.bind(this.client.account),
        };

        return new ListProxy(entity, null, wrapOptions({}));
    }
}
