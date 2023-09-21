import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { BrowserDynamicTestingModule }
    from "@angular/platform-browser-dynamic/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { GlobalStorage, USER_SERVICE, UserConfigurationService }
    from "@batch-flask/core";
import {
    I18nTestingModule,
    MockGlobalStorage,
    MockUserConfigurationService
} from "@batch-flask/core/testing";
import { ElectronTestingModule } from "@batch-flask/electron/testing";
import { ButtonsModule, DialogService, FormModule, SelectModule }
    from "@batch-flask/ui";
import { AuthService, BatchExplorerService } from "app/services";
import { BehaviorSubject } from "rxjs";
import { FileGroupPickerComponent } from "./file-group-picker.component";
import { FileGroupPickerModule } from "./file-group-picker.module";

@Component({
    template: `<bl-file-group-picker [formControl]="control"></bl-file-group-picker>`,
})
class TestComponent {
    public control = new FormControl();
}

describe("FileGroupPickerComponent", () => {
    let testComponent: TestComponent;
    let component: FileGroupPickerComponent;
    let fixture: ComponentFixture<TestComponent>;
    let de: DebugElement;

    const userServiceSpy = { currentUser: new BehaviorSubject(null) };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                FormModule,
                FormsModule,
                ReactiveFormsModule,
                SelectModule,
                RouterTestingModule,
                I18nTestingModule,
                HttpClientTestingModule,
                ButtonsModule,
                ElectronTestingModule,
                BrowserDynamicTestingModule,
                FileGroupPickerModule
            ],
            declarations: [TestComponent],
            providers: [
                { provide: BatchExplorerService, useValue: {} },
                { provide: UserConfigurationService, useValue:
                    new MockUserConfigurationService({}) },
                { provide: AuthService, useValue: userServiceSpy },
                { provide: GlobalStorage, useValue: new MockGlobalStorage() },
                { provide: USER_SERVICE, useValue: userServiceSpy },
                { provide: DialogService, useValue: {} },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        testComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css("bl-file-group-picker"));
        component = fixture.debugElement.query(By.css("bl-file-group-picker"))
            .componentInstance;
        fixture.detectChanges();
    });

    it("should pick an existing value", () => {
        const testValue = 'existingValue';
        component.fileGroupPicked(testValue);
        fixture.detectChanges();
        expect(component.value.value).toEqual(testValue);
    });

    it("should create a new file group on null value", () => {
        const spy = spyOn(component, "createFileGroup");
        const testValue = null;
        component.fileGroupPicked(testValue);
        fixture.detectChanges();
        expect(spy).toHaveBeenCalledOnce();
    });

    afterEach(() => {
        fixture.destroy();
    });
});
