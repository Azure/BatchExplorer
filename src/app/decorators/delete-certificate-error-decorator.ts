import { DeleteCertificateError, NameValuePair } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class DeleteCertificateErrorDecorator extends DecoratorBase<DeleteCertificateError> {
    public code: string;
    public message: string;
    public values: NameValuePair[];
    public details: string;

    /**
     * Combination of the error in a small summary to be displayed in grid for example
     */
    public summary: string;

    /**
     * Flag to know if the error exists
     */
    public exists: boolean;

    constructor(error: DeleteCertificateError) {
        super(error);

        this.exists = Boolean(error);
        this.code = this.stringField(error.code);
        this.message = this.stringField(error.message);
        this.values = error.values;
        this.details = this._getDetails(error.values);
        this.summary = this.exists
            ? `code: ${error.code}, message: ${error.message}`
            : "";
    }

    private _getDetails(values: NameValuePair[]): string {
        if (values && values.length > 0) {
            return values.map(value => {
                return `${value.name}: ${value.value}`;
            }).join("<br />");        }

        return "";
    }
}
