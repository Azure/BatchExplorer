import { Constants } from "common";
import * as Url from "url";

export enum BatchLabsLinkAction {
    route = "route",
}

export interface BatchLabsLinkAttributes {
    action: BatchLabsLinkAction;
    path: string;
    queryParams: URLSearchParams;
    session: string;
    accountId: string;
}

/**
 * Class containing information defined in a BatchLabsLink(link starting with ms-batchlabs://)
 */
export class BatchLabsLink implements BatchLabsLinkAttributes {
    public action: BatchLabsLinkAction;
    public path: string;
    public queryParams: URLSearchParams;

    /**
     * Session that can be used by the application
     * opening batchlabs to update a specific window instead of opening a new one
     */
    public session: string;

    /**
     *
     */
    public accountId: string;

    constructor(link?: string | BatchLabsLinkAttributes | BatchLabsLink) {
        if (!link) { return; }
        if (typeof link === "string") {
            this._parseLink(link);
        } else {
            this.action = link.action;
            this.path = link.path;
            this.queryParams = link.queryParams;
            this.session = link.session;
            this.accountId = link.accountId;
        }
    }

    public toString(): string {
        const queryParams = new URLSearchParams(this.queryParams);
        if (this.accountId) {
            queryParams.append("accountId", this.accountId);
        }
        if (this.session) {
            queryParams.append("session", this.accountId);
        }
        return `ms-batchlabs://${this.action}/${this.path}?${this.queryParams}`;
    }

    private _parseLink(link: string) {
        const url = Url.parse(link);
        if (url.protocol !== Constants.customProtocolName + ":") {
            // TODO-TIM check this
            // log.error(`Cannot open this link in batchlabs, unknown protocol '${url.protocol}'`, { link });
            return null;
        }
        const queryParams = new URLSearchParams(url.query as string);
        queryParams.delete("accountId");
        queryParams.delete("session");
        this.accountId = queryParams.get("accountId");
        this.session = queryParams.get("session");
        this.action = url.host as BatchLabsLinkAction;
        this.path = url.pathname;
        this.queryParams = queryParams;

    }
}
