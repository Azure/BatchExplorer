import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "@batch-flask/core";
import { BaseModule } from "@batch-flask/ui";
import { CommonModule as BECommonModule } from "app/components/common";

export const commonModules = [
    MaterialModule,
    CommonModule,
    BECommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    BaseModule,
];
