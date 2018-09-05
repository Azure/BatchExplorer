import { Component, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterTestingModule } from "@angular/router/testing";
import { List } from "immutable";
import { BehaviorSubject, of } from "rxjs";

import { NavigableRecord, PinnableEntity, PinnedEntityType } from "@batch-flask/core";
import { ContextMenuService } from "@batch-flask/ui";
import { DropdownModule } from "@batch-flask/ui/dropdown";
import { BatchAccountService, PinnedEntityService } from "app/services";
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

    let favorites: BehaviorSubject<List<NavigableRecord>>;
    let accountServiceSpy;
    let pinServiceSpy;
    let dropDownButton;

    beforeEach(() => {
        favorites = new BehaviorSubject(List([]));
        pinServiceSpy = {
            favorites: favorites.asObservable(),
            unPinFavorite: jasmine.createSpy("unPinFavorite").and.callFake((favorite) => {
                // remove from fav list
                const favArray = favorites.value.toArray();
                favArray.splice(0, 1);
                favorites.next(List(favArray));
            }),
        };

        accountServiceSpy = {
            currentAccount: of(Fixtures.account.create({
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
                { provide: BatchAccountService, useValue: accountServiceSpy },
                { provide: PinnedEntityService, useValue: pinServiceSpy },
                { provide: ContextMenuService, useValue: null },
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
            expect(component.entityType(createPin(PinnedEntityType.Certificate))).toBe("Batch certificate");
            expect(component.entityType(createPin(PinnedEntityType.JobSchedule))).toBe("Batch job schedule");
            expect(component.entityType(createPin(null))).toBe("unknown");
        });

        it("should return the correct icon", () => {
            expect(component.entityIcon(createPin(PinnedEntityType.Application))).toBe("fa-file-archive-o");
            expect(component.entityIcon(createPin(PinnedEntityType.Job))).toBe("fa-tasks");
            expect(component.entityIcon(createPin(PinnedEntityType.Pool))).toBe("fa-database");
            expect(component.entityIcon(createPin(PinnedEntityType.StorageContainer))).toBe("fa-cloud-upload");
            expect(component.entityIcon(createPin(PinnedEntityType.Certificate))).toBe("fa-certificate");
            expect(component.entityIcon(createPin(PinnedEntityType.JobSchedule))).toBe("fa-calendar");
            expect(component.entityIcon(createPin(null))).toBe("fa-question");
        });
    });

    describe("when there are no favorites", () => {
        it("should show no favorites title", () => {
            expect(component.title).toBe("No favorite items pinned");
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

            // type is now in icon title
            const icon = items[0].query(By.css(".fa.fa-tasks")).nativeElement;
            expect(icon).toBeDefined();
            expect(icon.getAttribute("title")).toBe("Batch job");
        });
    });

    describe("when there are more than one favorite", () => {
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
            expect(items[1].nativeElement.textContent).toContain("my-name-is-bob");
            expect(items[1].nativeElement.textContent).not.toContain("my-pool-bob");
        });
    });

    describe("when we remove favorites", () => {
        beforeEach(() => {
            favorites.next(List([
                Fixtures.pinnable.create({
                    id: "my-apple",
                    routerLink: ["/certificates", "my-apple"],
                    pinnableType: PinnedEntityType.Certificate,
                    url: "https://myaccount.westus.batch.com/jobs/my-apple",
                }),
            ]));

            dropDownButton.nativeElement.click();
            fixture.detectChanges();
        });

        it("should be one favorite", () => {
            expect(favorites.value.count()).toBe(1);
        });

        it("should remove favorite", () => {
            component.removeFavorite(favorites.value.toArray()[0] as any);
            expect(pinServiceSpy.unPinFavorite).toHaveBeenCalledTimes(1);
            expect(favorites.value.count()).toBe(0);
        });
    });
});
