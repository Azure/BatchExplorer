import { Type } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Dto } from "app/core";
import { FormUtils } from "app/utils";

export abstract class DynamicForm<TEntity, TDto extends Dto<TDto>> {
    public originalData: TDto;
    public form: FormGroup;

    constructor(private dtoType: Type<TDto>) { }
    public setValue(value: TDto) {
        this.originalData = value;
        this.form.patchValue(this.dtoToForm(value));
    }

    public disable(path: string | string[]) {
        const control = FormUtils.getControl(this.form, path);
        control.disable();
    }

    public setValueFromEntity(value: TEntity) {
        this.setValue(new this.dtoType((value as any).toJS()));
    }

    public getCurrentValue(): TDto {
        // Change to form.getRawValue() as form.value does not return disabled control values
        return new this.dtoType(Object.assign({}, this.originalData, this.formToDto(this.form.getRawValue())));
    }

    public abstract formToDto(value: any): TDto;
    public abstract dtoToForm(dto: TDto): any;
}
