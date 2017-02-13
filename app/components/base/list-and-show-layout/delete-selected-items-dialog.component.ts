import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

@Component({
    selector: "bex-delete-selected-items-dialog",
    template: `
        <div class="confirmation-dialog">
            <h2>Delete {{ entityName || "items" }}</h2>
            <div class="message">
                <p>You are about to delete the selected items, including:</p>
                <ul class="list-point">
                    <li *ngFor="let item of items">
                        <span *ngIf="parentId">{{ parentId }} - {{item}}</span>
                        <span *ngIf="!parentId">{{item}}</span>
                    </li>
                </ul>
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
export class DeleteSelectedItemsDialogComponent {
    public parentId: string;

    public entityName: string;

    public items: string[];

    constructor(public dialogRef: MdDialogRef<DeleteSelectedItemsDialogComponent>) {
    }
}
