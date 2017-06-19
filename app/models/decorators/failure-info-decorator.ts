import {List} from "immutable";

import { FailureInfo } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class FailureInfoDecorator extends DecoratorBase<FailureInfo> {
    public category: string;
    public code: string;
    public message: string;
    public details: string;

    /**
     * Combination of the error in a small summary to be displayed in grid for example
     */
    public summary: string;

    /**
     * Flag to know if the error exists
     */
    public exists: boolean;

    constructor(error: FailureInfo) {
        super(error);

        this.exists = Boolean(error && error.category);
        this.category = this.stringField(error.category);
        this.code = this.stringField(error.code);
        this.message = this.stringField(error.message);
        this.details = this._getDetails(error.details);
        this.summary = this.exists
            ? String.prototype.format("category: {0}, code: {1}, message: {2}",
                error.category,
                error.code,
                error.message)
            : "";
    }

    private _getDetails(details: List<NameValuePair>): string {
        if (details && details.size > 0) {
            const detailMessage = details.filter(x => x.name === "Message").first();

            if (detailMessage) {
                return detailMessage.value;
            }
        }

        return "";
    }
}
