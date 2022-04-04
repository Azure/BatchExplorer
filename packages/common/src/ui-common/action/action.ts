import { Form, FormValues } from "../form";

export interface Action<V extends FormValues> {
    form: Form<V>;
    validate(): Promise<void>;
    onValidate(): Promise<void>;
    execute(formValues: V): Promise<void>;
}

export abstract class AbstractAction<V extends FormValues>
    implements Action<V>
{
    form: Form<V>;

    constructor(initialValues: V) {
        this.form = this.buildForm(initialValues);
    }

    abstract buildForm(initialValues: V): Form<V>;

    async validate(): Promise<void> {
        await this.form.validate();
        this.onValidate();
    }

    abstract onValidate(): Promise<void>;

    abstract execute(formValues: V): Promise<void>;
}
