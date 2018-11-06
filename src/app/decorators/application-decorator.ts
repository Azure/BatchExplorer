import { BatchApplication } from "app/models";
import { DecoratorBase } from "app/utils/decorators";

export class ApplicationDecorator extends DecoratorBase<BatchApplication> {
    public id: string;
    public displayName: string;
    public allowUpdates: string;
    public defaultVersion: string;

    constructor(application: BatchApplication) {
        super(application);

        this.id = this.stringField(application.id);
        this.displayName = this.stringField(application.displayName, true);
        this.allowUpdates = this.booleanField(application.allowUpdates);
        this.defaultVersion = this.stringField(application.defaultVersion);
    }
}
