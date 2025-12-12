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
import {RootPane} from "@azure/bonito-ui/lib/components/layout";
import { Subscription } from "rxjs";
import { Theme, ThemeService } from "app/services";
import { ThemeName } from "@azure/bonito-ui/lib/theme";
import { createRoot, Root } from 'react-dom/client';

export const ReactWrapper: React.FC<React.PropsWithChildren> = props => {
    return React.createElement(RootPane, {theme: "explorerDark"}, props.children);
};

export const NoComponentFound: React.FC = props => {
    return React.createElement("div", {className: "be-no-component-found"});
};

@Component({
    selector: "be-reactcontainer",
    template: `<ng-container *ngIf="themeInitialized"><div class="react-root" #container></div></ng-container>`,
})
export class ReactContainerComponent<P> implements OnChanges, OnDestroy, AfterViewChecked {

    @ViewChild('container') rootElement: ElementRef;

    @Input() public component: React.FC<P> | React.ComponentClass<P>;
    @Input() public props: P;
    public themeInitialized: boolean = false;

    private _initialized: boolean = false;

    private _subs: Subscription[] = [];

    private _themeName: ThemeName = "explorerLight";

    private _themeService: ThemeService;

    private _root: Root;

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
        if (!this._root) {
            this._root = createRoot(this.rootElement.nativeElement);
        }
        this._root.render(
            React.createElement(RootPane, {theme : this._themeName},
                React.createElement(this.component ?? NoComponentFound, this.props)
            )
        );

    }

    ngOnDestroy(): void {
        for(const sub of this._subs) {
            sub.unsubscribe();
        }

        if (this._initialized && this.rootElement) {
            if (this._root) {
                this._root.unmount();
                this._root = null;
            }
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
