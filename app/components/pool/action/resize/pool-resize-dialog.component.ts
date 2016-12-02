import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { SidebarRef } from "../../../base/sidebar";
import { Pool } from "app/models";
import { PoolService } from "app/services";

@Component({
    selector: "bex-pool-resize-dialog",
    template: require("./pool-resize-dialog.html"),
})

export class PoolResizeDialogComponent implements OnInit {
    @Input()
    public set pool(value: Pool) {
        if (value) {
            this._pool = value;
            this.targetDedicated = this._pool.targetDedicated;
        }
    }
    public get pool() { return this._pool; }
    public targetDedicated: number;
    public isSaving: boolean = false;

    private _pool: Pool;

    constructor(
        private formBuilder: FormBuilder,
        public sidebarRef: SidebarRef<PoolResizeDialogComponent>,
        private poolService: PoolService) {
    }

    public ngOnInit() {
        return;
    }

    public onSubmit() {
        this.isSaving = true;
        this.poolService.resize(this.pool.id, this.targetDedicated, {}).subscribe(
            (val) => {/*this.resetForm();*/ },
            (error) => { console.error("resizePool() :: error: ", error); },
            () => {
                this.isSaving = false;
                this.sidebarRef.destroy();
            }
        );
    }
}
