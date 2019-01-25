import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { ButtonsModule } from "@batch-flask/ui";
import { EditableTableComponent, EditableTableModule } from "@batch-flask/ui/form/editable-table";
import { CachingType, StorageAccountType } from "app/models";
import { DataDiskDto } from "app/models/dtos/virtual-machine-configuration.dto";
import { DataDiskPickerComponent } from "./data-disk-picker.component";

@Component({
    template: `<bl-data-disk-picker [formControl]="disks"></bl-data-disk-picker>`,
})
class TestComponent {
    public disks = new FormControl<DataDiskDto[]>();
}

describe("DataDiskPickerComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let testComponent: TestComponent;
    let editableTableEl: DebugElement;
    let editableTable: EditableTableComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, ButtonsModule, I18nTestingModule, EditableTableModule],
            declarations: [DataDiskPickerComponent, TestComponent],
        });
        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        fixture.detectChanges();

        editableTableEl = fixture.debugElement.query(By.css("bl-editable-table"));
        editableTable = editableTableEl.componentInstance;
    });

    it("should have the right column keys", () => {
        const columns = editableTable.columns.toArray();

        expect(columns.length).toBe(4);
        expect(columns[0].name).toBe("caching");
        expect(columns[1].name).toBe("diskSizeGB");
        expect(columns[2].name).toBe("lun");
        expect(columns[3].name).toBe("storageAccountType");
    });

    it("should have the right column labels", () => {
        const columns = editableTableEl.queryAll(By.css("thead th"));

        expect(columns.length).toBe(5);
        expect(columns[0].nativeElement.textContent).toContain("Caching");
        expect(columns[1].nativeElement.textContent).toContain("Size in GB");
        expect(columns[2].nativeElement.textContent).toContain("Lun");
        expect(columns[3].nativeElement.textContent).toContain("Storage type");
    });

    it("Should update the disks", () => {
        editableTable.items.at(0).markAsDirty();
        editableTable.items.at(0).setValue({
            caching: CachingType.Readonly,
            diskSizeGB: 1024,
            lun: 2,
            storageAccountType: StorageAccountType.PremiumLrs,
        });
        expect(testComponent.disks.value.map(x => x.toJS())).toEqual([{
            caching: CachingType.Readonly,
            diskSizeGB: 1024,
            lun: 2,
            storageAccountType: StorageAccountType.PremiumLrs,
        }]);
    });

    it("Should have default values for the rows", () => {
        editableTable.items.at(0).markAsDirty();
        editableTable.items.at(0).patchValue({
            diskSizeGB: 2048,
            lun: 4,
        });
        expect(testComponent.disks.value.map(x => x.toJS())).toEqual([{
            caching: CachingType.Readwrite,
            diskSizeGB: 2048,
            lun: 4,
            storageAccountType: StorageAccountType.StandardLrs,
        }]);
    });

    it("udpates the editable table with changes", () => {
        testComponent.disks.setValue([new DataDiskDto({
            caching: CachingType.Readonly,
            diskSizeGB: 1024,
            lun: 2,
            storageAccountType: StorageAccountType.PremiumLrs,
        })]);

        expect(editableTable.items.value).toEqual([
            {
                caching: CachingType.Readonly,
                diskSizeGB: 1024,
                lun: 2,
                storageAccountType: StorageAccountType.PremiumLrs,
            },
            {
                caching: CachingType.Readwrite,
                diskSizeGB: null,
                lun: null,
                storageAccountType: StorageAccountType.StandardLrs,
            },
        ]);
    });
});
