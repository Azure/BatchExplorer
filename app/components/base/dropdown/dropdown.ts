import { Component, HostListener, ModuleWithProviders, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";

@Component({
    selector: "bex-dropdown",
    template: `
        <div class="dropdown" (mouseenter)="mouseEnter()" (mouseleave)="mouseLeave()">
            <div class="bex-dropdown-btn-container" [ngClass]="{'active': showDropdown}">
                <ng-content select="[bex-dropdown-btn]" ></ng-content>
            </div>
            <ng-content *ngIf="showDropdown" select="[bex-dropdown-content]"></ng-content>
        </div>
    `,
})
export class DropdownComponent {

    public showDropdown = false;

    public mouseEnter() {
        this.showDropdown = true;
    }

    public mouseLeave() {
        this.showDropdown = false;
    }

    @HostListener("document:click", ["$event"])
    public onClick() {
        this.showDropdown = false;
    }
}

@NgModule({
    declarations: [
        DropdownComponent,
    ],
    exports: [
        DropdownComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule.forRoot(),
    ],
})
export class DropdownModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: DropdownModule,
            providers: [],
        };
    }
}
