import { Pipe, PipeTransform } from "@angular/core";
import { I18nService } from "@batch-flask/core";

@Pipe({
    name: "i18n",
    pure: true,
})
export class I18nPipe implements PipeTransform {

    constructor(private i18n: I18nService) {

    }

    public transform(value: string) {
        return this.i18n.translate(value);
    }
}
