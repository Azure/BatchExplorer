import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";

import { MaterialModule } from "@bl-common/core";
import { BaseModule } from "@bl-common/ui";
import { CommonModule } from "app/components/common";

export const commonModules = [
    BrowserModule, MaterialModule, RouterModule,
    FormsModule, ReactiveFormsModule,
    CommonModule, BaseModule,
];
