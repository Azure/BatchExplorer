import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "@angular/material";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { BaseModule } from "app/components/base";

export const commonModules = [
    BrowserModule, MaterialModule, RouterModule,
    FormsModule, ReactiveFormsModule,
    BaseModule,
];
