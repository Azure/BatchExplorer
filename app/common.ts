import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { BaseModule } from "app/components/base";
import { MaterialModule } from "app/core";

export const commonModules = [
    BrowserModule, MaterialModule, RouterModule,
    FormsModule, ReactiveFormsModule,
    BaseModule,
];
