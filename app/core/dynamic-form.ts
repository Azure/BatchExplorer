import { Type } from "@angular/core";
import { FormGroup } from "@angular/forms";

export abstract class DynamicForm<TEntity, TDto> {
    public originalData: TDto;
    public form: FormGroup;

    constructor(private dtoType: Type<TDto>) { }
    public setValue(value: TDto) {
        this.originalData = value;
        this.form.patchValue(this.dtoToForm(value));
    }

    public setValueFromEntity(value: TEntity) {
        this.setValue(new this.dtoType((value as any).toJS()));
    }

    public getCurrentValue(): TDto {
        return Object.assign({}, this.originalData, this.formToDto(this.form.value));
    }

    public abstract formToDto(value: any): TDto;
    public abstract dtoToForm(dto: TDto): any;
}
