import * as Url from "url";
import { Constants } from "../constants";

export enum BatchExplorerLinkAction {
    route = "route",
}

export interface BatchExplorerLinkAttributes {
    action: BatchExplorerLinkAction;
    path: string;
    queryParams: Url.URLSearchParams;
    session: string;
    accountId: string;
}

export class BatchExplorerInvalidLinkError extends Error {
    constructor(public link: string, message: string) {
        super(message);
    }
}

/**
 * Class containing information defined in a BatchExplorerLink(link starting with ms-batch-explorer://)
 */
export class BatchExplorerLink implements BatchExplorerLinkAttributes {
    public action: BatchExplorerLinkAction;
    public path: string;
    public queryParams: Url.URLSearchParams;

    /**
     * Session that can be used by the application
     * opening batchlabs to update a specific window instead of opening a new one
     */
    public session: string;

    /**
     *
     */
    public accountId: string;

    constructor(link?: string | BatchExplorerLinkAttributes | BatchExplorerLink) {
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
        const queryParams = new Url.URLSearchParams(this.queryParams);
        if (this.accountId) {
            queryParams.append("accountId", this.accountId);
        }
        if (this.session) {
            queryParams.append("session", this.session);
        }
        const path = [this.action, this.path].filter(x => Boolean(x)).join("");
        return `ms-batch-explorer://${path}?${queryParams}`;
    }

    private _parseLink(link: string) {
        const url = Url.parse(link);
        if (url.protocol !== Constants.customProtocolName + ":"
            && url.protocol !== Constants.legacyProtocolName + ":") {
            throw new BatchExplorerInvalidLinkError(link,
                `Link '${link}' doesn't use right protocol ${Constants.customProtocolName}`);
        }
        const queryParams = new Url.URLSearchParams(url.query as string);

        this.accountId = queryParams.get("accountId");
        this.session = queryParams.get("session");
        this.action = url.host as BatchExplorerLinkAction;
        this.path = url.pathname;

        queryParams.delete("accountId");
        queryParams.delete("session");
        this.queryParams = queryParams;
    }
}
