import { Inject, InjectionToken, Optional, Pipe, PipeTransform } from "@angular/core";
import { I18nService } from "@batch-flask/core";

export const I18N_NAMESPACE = new InjectionToken("I18N_NAMESPACE");

@Pipe({
    name: "i18n",
    pure: true,
})
export class I18nPipe implements PipeTransform {

    constructor(private i18n: I18nService, @Optional() @Inject(I18N_NAMESPACE) private namespace?: string) {

    }

    public transform(key: string, params?: any) {
        if (this.namespace) {
            const namespacedKey = this.i18n.resolveKey(this.namespace, key);
            return this.i18n.translate(namespacedKey, params);
        } else {
            return this.i18n.translate(key, params);
        }
    }
}
