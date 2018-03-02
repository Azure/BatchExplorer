import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { BaseModule } from "@bl-common/ui";
import { CommonModule } from "app/components/common";
import { MaterialModule } from "@bl-common/core";

export const commonModules = [
    BrowserModule, MaterialModule, RouterModule,
    FormsModule, ReactiveFormsModule,
    CommonModule, BaseModule,
];
