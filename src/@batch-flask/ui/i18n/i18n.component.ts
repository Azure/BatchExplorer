import {
    AfterContentInit, ChangeDetectionStrategy,
    ChangeDetectorRef, Component, ContentChildren, Directive,
    Input, QueryList, TemplateRef,
} from "@angular/core";
import { I18nService } from "@batch-flask/core";

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: "[i18nParam]",
})
export class I18nParameterDirective {
    @Input() public i18nParam: string;

    constructor(public templateRef: TemplateRef<any>) {

    }
}

@Component({
    selector: "bl-i18n",
    templateUrl: "i18n.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class I18nComponent implements AfterContentInit {
    @Input() public key: string;

    @ContentChildren(I18nParameterDirective) public params: QueryList<I18nParameterDirective>;

    public segments: any[];
    private _paramsMap: StringMap<I18nParameterDirective>;

    constructor(private i18nService: I18nService, private changeDetector: ChangeDetectorRef) {

    }

    public ngAfterContentInit() {
        this._updateParams();
        this.params.changes.subscribe(() => {
            this._updateParams();
        });
    }

    public trackSegment(index, _) {
        return index;
    }

    private _updateParams() {
        const params = {};
        for (const param of this.params.toArray()) {
            params[param.i18nParam] = param;
        }
        this._paramsMap = params;
        this._computeTranslation();
    }

    private _computeTranslation() {
        const translation = this.i18nService.translate(this.key);

        if (this.params.length > 0) {
            const params = this._paramsMap;
            const splited = translation.split(/({[a-zA-Z0-9_.-]+})/);
            const segments = [];
            for (const segment of splited) {
                const lastIndex = segment.length - 1;
                const paramName = segment.slice(1, lastIndex);
                if (segment[0] === "{" && segment[lastIndex] === "}" && paramName in params) {
                    segments.push({ type: "param", content: params[paramName] });
                } else {
                    segments.push({ type: "string", content: segment });
                }
            }
            this.segments = segments;
            this.changeDetector.markForCheck();
        } else {
            this.segments = [{ type: "string", content: translation }];
        }
    }
}
