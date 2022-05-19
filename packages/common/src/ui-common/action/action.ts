import { Form, FormValues } from "../form";

export interface Action<V extends FormValues> {
    form: Form<V>;
    validate(): Promise<void>;
    execute(formValues: V): Promise<void>;
}

export abstract class AbstractAction<V extends FormValues>
    implements Action<V>
{
    form: Form<V>;

    constructor(initialValues: V) {
        this.form = this.buildForm(initialValues);
    }

    async validate(): Promise<void> {
        await this.form.validate();
        if (this.onValidate) {
            await this.onValidate();
        }
    }

    abstract buildForm(initialValues: V): Form<V>;

    abstract onValidate?(): Promise<void>;

    abstract execute(formValues: V): Promise<void>;
}
