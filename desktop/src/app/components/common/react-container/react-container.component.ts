import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    ViewChild,
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
    template: `<div class="react-root" #container></div>`
})
export class ReactContainerComponent<P> implements AfterViewInit, OnChanges, OnDestroy {

    @ViewChild('container') rootElement: ElementRef;

    @Input() public component: React.FC<P> | React.ComponentClass<P>
    @Input() public props: P;

    private _initialized: boolean = false;
    private _isMounted: boolean = false;

    private _subs: Subscription[] = [];

    private _themeName: string = "explorerLight";


    ngAfterViewInit() {
        this._initialized = true;
        this._render();
        this._isMounted = true;
    }

    ngOnChanges() {
        if (this._initialized) {
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
        if (this._isMounted) {
            ReactDOM.unmountComponentAtNode(this.rootElement.nativeElement);
        }
    }


    constructor(themeService: ThemeService) {
        this._subs.push(themeService.currentTheme.subscribe((theme) => {
            this._setTheme(theme);
        }));
        console.log("Constructor Executed");
    }

    private _setTheme(theme: Theme) {
        console.log("theme.name 1: " + theme.name);
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
