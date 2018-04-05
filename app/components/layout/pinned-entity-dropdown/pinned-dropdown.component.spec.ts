import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { List } from "immutable";
import { BehaviorSubject, Observable } from "rxjs";

import { NavigableRecord, PinnableEntity, PinnedEntityType } from "@batch-flask/core";
import { DropdownModule } from "@batch-flask/ui/dropdown";
import { AccountService, PinnedEntityService } from "app/services";
import * as Fixtures from "test/fixture";
import { PinnedDropDownComponent } from "./pinned-dropdown.component";

@Component({
    template: "<bl-pinned-dropdown></bl-pinned-dropdown>",
})
class TestComponent {
}

function createPin(type?: PinnedEntityType): PinnableEntity {
    return Fixtures.pinnable.create({ pinnableType: type });
}

describe("PinnedDropDownComponent", () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: PinnedDropDownComponent;
    let debugElement;

    const favorites: BehaviorSubject<List<NavigableRecord>> = new BehaviorSubject(List([]));
    let accountServiceSpy;
    let pinServiceSpy;
    let dropDownButton;

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
        dropDownButton = debugElement.query(By.css("[bl-dropdown-btn]"));
        component = debugElement.componentInstance;
        fixture.detectChanges();
    });

    describe("basic setup", () => {
        it("should return the correct type name", () => {
            expect(component.entityType(createPin(PinnedEntityType.Application))).toBe("Batch application");
            expect(component.entityType(createPin(PinnedEntityType.Job))).toBe("Batch job");
            expect(component.entityType(createPin(PinnedEntityType.Pool))).toBe("Batch pool");
            expect(component.entityType(createPin(PinnedEntityType.StorageContainer))).toBe("Storage container");
            expect(component.entityType(createPin(null))).toBe("unknown");
        });

        it("should return the correct icon", () => {
            expect(component.entityIcon(createPin(PinnedEntityType.Application))).toBe("fa-file-archive-o");
            expect(component.entityIcon(createPin(PinnedEntityType.Job))).toBe("fa-tasks");
            expect(component.entityIcon(createPin(PinnedEntityType.Pool))).toBe("fa-database");
            expect(component.entityIcon(createPin(PinnedEntityType.StorageContainer))).toBe("fa-cloud-upload");
            expect(component.entityIcon(createPin(null))).toBe("fa-question");
        });
    });

    describe("when there are no favorites", () => {
        it("should show no favorites title", () => {
            expect(component.title).toBe("No favorite items pinned");
            expect((component as any)._accountEndpoint).toBe("myaccount.westus.batch.com");
            expect(dropDownButton.nativeElement.textContent).toContain("No favorite items pinned");
        });

        it("drop down should have no items", () => {
            const items = debugElement.queryAll(By.css(".dropdown-item"));
            expect(items.length).toBe(0);
        });
    });

    describe("when there are favorites", () => {
        beforeEach(() => {
            const pin = Fixtures.pinnable.create({
                id: "my-job-fred",
                routerLink: ["/jobs", "my-job-fred"],
                pinnableType: PinnedEntityType.Job,
                url: "https://myaccount.westus.batch.com/jobs/my-job-fred",
            });

            favorites.next(List([pin]));
            dropDownButton.nativeElement.click();
            fixture.detectChanges();
        });

        it("should show favorite count in the title", () => {
            expect(component.title).toBe("1 favorite items pinned");
            expect(dropDownButton.nativeElement.textContent).toContain("1 favorite items pinned");
        });

        it("drop down should have 1 item", () => {
            const items = fixture.debugElement.queryAll(By.css(".dropdown-item"));
            expect(items.length).toBe(1);
            expect(items[0].nativeElement.textContent).toContain("my-job-fred");
            expect(items[0].nativeElement.textContent).toContain("Batch job");

            const icon = items[0].query(By.css(".fa.fa-tasks"));
            expect(icon.nativeElement).toBeDefined();
        });
    });

    describe("when there are more than one favorites", () => {
        beforeEach(() => {
            favorites.next(List([
                Fixtures.pinnable.create({
                    id: "my-job-matt",
                    routerLink: ["/jobs", "my-job-matt"],
                    pinnableType: PinnedEntityType.Job,
                    url: "https://myaccount.westus.batch.com/jobs/my-job-matt",
                }),
                Fixtures.pinnable.create({
                    id: "my-pool-bob",
                    name: "my-name-is-bob",
                    routerLink: ["/pools", "my-pool-bob"],
                    pinnableType: PinnedEntityType.Pool,
                    url: "https://myaccount.westus.batch.com/pools/my-pool-bob",
                }),
            ]));

            dropDownButton.nativeElement.click();
            fixture.detectChanges();
        });

        it("should show favorite count in the title", () => {
            expect(component.title).toBe("2 favorite items pinned");
            expect(dropDownButton.nativeElement.textContent).toContain("2 favorite items pinned");
        });

        it("drop down should have 2 items", () => {
            const items = debugElement.queryAll(By.css(".dropdown-item"));
            expect(items.length).toBe(2);
        });

        it("pool should show name over id", () => {
            const items = debugElement.queryAll(By.css(".dropdown-item"));
            expect(items[0].nativeElement.textContent).toContain("my-job-matt");
            expect(items[0].nativeElement.textContent).toContain("Batch job");

            expect(items[1].nativeElement.textContent).toContain("my-name-is-bob");
            expect(items[1].nativeElement.textContent).not.toContain("my-pool-bob");
            expect(items[1].nativeElement.textContent).toContain("Batch pool");
        });
    });
});
