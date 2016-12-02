import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

@Component({
    selector: "bex-delete-selected-items-dialog",
    template: `
        <div class="confirmation-dialog">
            <div class="message">
                You are about to delete all the selected items this include:
                <ul class="list-point"><li *ngFor="let item of items">{{item}}</li></ul>
            </div>
            <div class="buttons">
                <button md-raised-button (click)="dialogRef.close(true)" color="warn">
                    Yes
                </button>
                <button md-raised-button type="primary" (click)="dialogRef.close(false)">No</button>
            </div>
        </div>
    `,
})
export class DeletePoolDialogComponent {
    public poolId: string;

    public items: string[];

    constructor(public dialogRef: MdDialogRef<DeletePoolDialogComponent>) {
    }
}
