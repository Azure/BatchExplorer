import { FailureInfo, NameValuePair } from "app/models";
import { DecoratorBase } from "app/utils/decorators";
import { List } from "immutable";

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
            ? `category: ${error.category}, code: ${error.code}, message: ${error.message}`
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
