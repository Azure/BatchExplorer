import { Directive } from "@angular/core";

@Directive({
    standalone: false,
    selector: "[blFormFieldPrefix]",
})
export class FormFieldPrefixDirective {

}

@Directive({
    standalone: false,
    selector: "[blFormFieldSuffix]",
})
export class FormFieldSuffixDirective {

}
