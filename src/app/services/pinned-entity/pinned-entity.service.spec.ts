import { InMemoryDataStore, PinnableEntity, PinnedEntityType } from "@batch-flask/core";
import { Job } from "app/models";
import { List } from "immutable";
import { Subscription, of } from "rxjs";
import { filter, take } from "rxjs/operators";
import * as Fixtures from "test/fixture";
import { PinnedEntityService } from "./pinned-entity.service";

fdescribe("PinnedEntityService", () => {
    let pinService: PinnedEntityService;
    let favourites: List<PinnableEntity>;
    let subscriptions: Subscription[];
    let dataStore: InMemoryDataStore;
    let accountServiceSpy;

    beforeEach(async () => {
        subscriptions = [];
        favourites = List<PinnableEntity>();

        dataStore = new InMemoryDataStore();
        spyOn(dataStore, "setItem").and.callThrough();
        spyOn(dataStore, "getItem").and.callThrough();

        accountServiceSpy = {
            currentAccount: of(Fixtures.account.create({
                id: "myaccount",
                properties: {
                    accountEndpoint: "myaccount.westus.batch.com",
                },
            })),
        };

        pinService = new PinnedEntityService(dataStore as any, accountServiceSpy);
        await pinService.loaded.pipe(filter(x => x === true), take(1)).toPromise();
        subscriptions.push(pinService.favorites.subscribe(pinned => favourites = pinned));
    });

    afterEach(() => {
        pinService.ngOnDestroy();
        subscriptions.forEach(x => x.unsubscribe());
    });

    it("currentAccount forces load of favorite data", async () => {
        expect(dataStore.getItem).toHaveBeenCalledTimes(1);
        expect(favourites.size).toEqual(0);
    });

    describe("pinFavorite", () => {
        beforeEach(async () => {
            await pinService.pinFavorite(new Job({
                id: "my-job-matt",
                url: "https://myaccount.westus.batch.com/jobs/my-job-matt",
            })).toPromise();
        });

        it("saves to local storage", () => {
            expect(dataStore.setItem).toHaveBeenCalledTimes(1);
            expect(dataStore.setItem).toHaveBeenCalledWith(PinnedEntityService.KEY, {
                myaccount: [
                    [
                        "https://myaccount.westus.batch.com/jobs/my-job-matt",
                        {
                            id: "my-job-matt",
                            name: "my-job-matt",
                            routerLink: ["/jobs", "my-job-matt"],
                            pinnableType: "Job",
                            uid: "https://myaccount.westus.batch.com/jobs/my-job-matt",
                        },
                    ],
                ],
            });
            expect(favourites.size).toEqual(1);
        });

        it("saves correct data", async () => {
            const savedData = await dataStore.getItem(PinnedEntityService.KEY);
            expect(savedData as any).toEqual({
                myaccount: [
                    [
                        "https://myaccount.westus.batch.com/jobs/my-job-matt",
                        {
                            id: "my-job-matt",
                            name: "my-job-matt",
                            routerLink: ["/jobs", "my-job-matt"],
                            pinnableType: "Job",
                            uid: "https://myaccount.westus.batch.com/jobs/my-job-matt",
                        },
                    ],
                ],
            });
        });
    });

    describe("isFavorite", () => {
        let favorite: Job;
        beforeEach(async () => {
            favorite = new Job({
                id: "my-pin",
            });

            await pinService.pinFavorite(favorite).toPromise();
        });

        it("returns true if already saved", () => {
            expect(pinService.isFavorite(favorite)).toEqual(true);
        });

        it("returns false if same id but different type", () => {
            const clone = Object.assign({ id: "my-pin", pinnableType: PinnedEntityType.Pool }, favorite);
            expect(clone.id).toEqual("my-pin");
            expect(clone.pinnableType).toEqual(PinnedEntityType.Pool);
            expect(pinService.isFavorite(clone)).toEqual(false);
        });
    });

    describe("unPinFavorite", () => {
        let favorite: Job;

        beforeEach(async () => {
            favorite = new Job({
                id: "pin-2",
            });

            await pinService.pinFavorite(favorite).toPromise();
        });

        it("removes and saves if exists in list", async () => {
            expect(favourites.size).toEqual(1);
            expect(dataStore.setItem).toHaveBeenCalledTimes(1);

            await pinService.unPinFavorite(favorite).toPromise();
            expect(dataStore.setItem).toHaveBeenCalledTimes(2);
            expect(favourites.size).toEqual(0);
        });

        it("does nothing if not favorite", async () => {
            expect(dataStore.setItem).toHaveBeenCalledTimes(1);
            const clone = Object.assign({ id: "pin-3", pinnableType: PinnedEntityType.Pool }, favorite);
            await pinService.unPinFavorite(clone).toPromise();

            expect(dataStore.setItem).toHaveBeenCalledTimes(1);
        });
    });
});
