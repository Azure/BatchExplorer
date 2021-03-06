import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    ViewChild,
    AfterViewChecked, ChangeDetectionStrategy
} from "@angular/core";
import * as React from "react";
import * as ReactDOM from "react-dom";
import {RootPane} from "@batch/ui-react/lib/components/layout"
import { Subscription } from "rxjs";
import { Theme, ThemeService } from "app/services";

export const ReactWrapper: React.FC = props => {
    return React.createElement(RootPane, {theme: "explorerDark"}, props.children);
};

export const NoComponentFound: React.FC = props => {
    return React.createElement("div", {className: "be-no-component-found"});
};

@Component({
    selector: "bl-reactcontainer",
    template: `<ng-container *ngIf="themeInitialized"><div class="react-root" #container></div></ng-container>`,
})
export class ReactContainerComponent<P> implements OnChanges, OnDestroy, AfterViewChecked {

    @ViewChild('container') rootElement: ElementRef;

    @Input() public component: React.FC<P> | React.ComponentClass<P>
    @Input() public props: P;
    public themeInitialized: boolean = false;

    private _initialized: boolean = false;

    private _subs: Subscription[] = [];

    private _themeName: string = "explorerLight";

    private _themeService: ThemeService;

    constructor(themeService: ThemeService) {
        this._themeService = themeService;

        this._subs.push(this._themeService.currentTheme.subscribe((theme) => {
            if (theme) {
                this._setTheme(theme);
                this.themeInitialized = true;
            }
        }));
    }

    ngAfterViewChecked() {
        if (!this._initialized && this.rootElement) {
            this._render();
            this._initialized = true;
        }
    }

    ngOnChanges() {
        if (this._initialized && this.rootElement) {
            this._render();
        }
    }

    private _render() {
        ReactDOM.render(
            React.createElement(RootPane, {theme : this._themeName},
                React.createElement(this.component ?? NoComponentFound, this.props)
            )
        , this.rootElement.nativeElement);

    }

    ngOnDestroy(): void {
        for(const sub of this._subs) {
            sub.unsubscribe();
        }

        if (this._initialized && this.rootElement) {
            ReactDOM.unmountComponentAtNode(this.rootElement.nativeElement);
        }
    }

    private _setTheme(theme: Theme) {
        if (theme.name == "dark") {
            this._themeName = "explorerDark";
        }  else if (theme.name == "classic") {
            this._themeName = "explorerLight";
        } else if (theme.name == "high-contrast") {
            this._themeName = "explorerHighContrastDark";
        } else if (theme.name == "unknown") {
            this._themeName = "explorerHighContrastLight";
        }

    }

}
