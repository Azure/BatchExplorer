import { Component } from "@angular/core";
import { MdDialogRef } from "@angular/material";

@Component({
    selector: "bl-delete-selected-items-dialog",
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
                <bl-button type="wide" (click)="dialogRef.close(true)" color="danger">
                    Yes
                </bl-button>
                <bl-button type="wide" type="primary" (click)="dialogRef.close(false)" color="light">No</bl-button>
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
