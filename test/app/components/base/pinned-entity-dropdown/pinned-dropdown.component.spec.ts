import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { DropdownModule } from "app/components/base/dropdown";
import { PinnedDropDownComponent } from "app/components/base/pinned-entity-dropdown";
import { PinnedEntity, PinnedEntityType } from "app/models";
import { AccountService, PinnedEntityService } from "app/services";
import * as Fixtures from "test/fixture";

@Component({
    template: "<bl-pinned-dropdown></bl-pinned-dropdown>",
})
class TestComponent {
}

fdescribe("PinnedDropDownComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: PinnedDropDownComponent;
    let debugElement;
    let favorites: BehaviorSubject<List<PinnedEntity>> = new BehaviorSubject(List([]));
    let accountServiceSpy;
    let pinServiceSpy;

    beforeEach(() => {
        pinServiceSpy = {
            favorites: favorites.asObservable(),
        };

        accountServiceSpy = {
            currentAccount: Observable.of(Fixtures.account.create({
                id: "myaccount",
                properties: {
                    accountEndpoint: "myaccount.westus.batch.com",
                },
            })),
        };

        TestBed.configureTestingModule({
            imports: [DropdownModule, RouterTestingModule],
            declarations: [PinnedDropDownComponent, TestComponent],
            providers: [
                { provide: AccountService, useValue: accountServiceSpy },
                { provide: PinnedEntityService, useValue: pinServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(TestComponent);
        debugElement = fixture.debugElement.query(By.css("bl-pinned-dropdown"));
        component = debugElement.componentInstance;
        fixture.detectChanges();
    });

    describe("basic setup", () => {
        it("should return the correct type name", () => {
            let pinnable = Fixtures.pinnable.create({ pinnableType: PinnedEntityType.Application });
            expect(component.entityType(pinnable)).toBe("Batch application");

            pinnable = Fixtures.pinnable.create({ pinnableType: PinnedEntityType.Job });
            expect(component.entityType(pinnable)).toBe("Batch job");

            pinnable = Fixtures.pinnable.create({ pinnableType: PinnedEntityType.Pool });
            expect(component.entityType(pinnable)).toBe("Batch pool");

            pinnable = Fixtures.pinnable.create({ pinnableType: PinnedEntityType.FileGroup });
            expect(component.entityType(pinnable)).toBe("File group");
        });
    });

    describe("when there are no favorites", () => {
        // beforeEach(() => {
        //     serviceSpy.crumbs.next([poolsCrumb, pool1Crumb, pool1PropertiesCrumb]);
        //     fixture.detectChanges();
        // });

        it("should show no favorites", () => {
            expect(component.title).toBe("No favorite items pinned");
            expect((component as any)._accountEndpoint).toBe("myaccount.westus.batch.com");

            const ddlButton = debugElement.query(By.css("[bl-dropdown-btn]"));
            expect(ddlButton.nativeElement.textContent).toContain("No favorite items pinned");
        });
    });
});
