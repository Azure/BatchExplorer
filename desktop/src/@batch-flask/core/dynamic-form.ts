import { Type } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Dto } from "@batch-flask/core/dto";
import { FormUtils } from "@batch-flask/utils";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface AsyncTask {
    name: string;
    done: Observable<any>;
}

export abstract class DynamicForm<TEntity, TDto extends Dto<TDto>> {
    public originalData: TDto;
    public form: FormGroup;
    public readonly asyncTasks: Observable<AsyncTask[]>;
    public readonly hasAsyncTask: Observable<boolean>;

    private _asyncTasks = new BehaviorSubject(new Map<number, AsyncTask>());

    constructor(private dtoType: Type<TDto>) {
        this.asyncTasks = this._asyncTasks.pipe(map(x => [...x.values()]));
        this.hasAsyncTask = this._asyncTasks.pipe(map(x => x.size > 0));
    }

    public setValue(value: TDto) {
        this.originalData = value;
        this.form.patchValue(this.dtoToForm(value));
    }

    /**
     * Disable form controls by given path
     * @param path path to form control, passing string array for nested form controls
     */
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

    public registerAsyncTask(
        name: string,
        done: Observable<any>) {
        const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        const value =  this._asyncTasks.value;
        value.set(id, {
            name,
            done,
        });
        this._asyncTasks.next(value);

        done.subscribe({
            next: () => {
                this.disposeAsyncTask(id);
            },
        });
        return id;
    }

    public disposeAsyncTask( id: number) {
        const value = this._asyncTasks.value;
        value.delete(id);
        this._asyncTasks.next(value);
    }

    public abstract formToDto(value: any): TDto;
    public abstract dtoToForm(dto: TDto): any;
}
