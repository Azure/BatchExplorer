import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { BatchApplication, Job, PinnableEntity, PinnedEntityType } from "app/models";
import { PinnedEntityService } from "app/services";
import * as Fixtures from "test/fixture";

let jsonDataFromFileService: any;
function getSavedData(): PinnableEntity[] {
    return jsonDataFromFileService;
}

fdescribe("PinnedEntityService", () => {
    let pinService: PinnedEntityService;
    let favourites: List<PinnableEntity> = List<PinnableEntity>();
    let subscriptions: Subscription[] = [];
    let localFileStorageSpy;
    let accountServiceSpy;

    let jsonFilename: string;

    beforeEach(() => {
        localFileStorageSpy = {
            get: jasmine.createSpy("get").and.returnValue(Observable.of(jsonDataFromFileService)),
            set: jasmine.createSpy("set").and.callFake((filename, jsonData) => {
                jsonDataFromFileService = jsonData;
                jsonFilename = filename;

                return Observable.of(null);
            }),
        };

        accountServiceSpy = {
            currentAccount: Observable.of(Fixtures.account.create({
                id: "myaccount",
                properties: {
                    accountEndpoint: "myaccount.westus.batch.com",
                },
            })),
        };

        favourites.clear();
        pinService = new PinnedEntityService(localFileStorageSpy, accountServiceSpy);
        subscriptions.push(pinService.favorites.subscribe(pinned => favourites = pinned));
    });

    afterEach(() => {
        pinService = null;
        subscriptions.forEach(x => x.unsubscribe());
    });

    it("currentAccount forces load of favorite data", () => {
        expect(localFileStorageSpy.get).toHaveBeenCalledTimes(1);
        expect(favourites.size).toEqual(0);
    });

    describe("pinFavorite", () => {
        beforeEach(() => {
            pinService.pinFavorite(new Job({
                id: "my-job-matt",
                url: "https://myaccount.westus.batch.com/jobs/my-job-matt",
            }));
        });

        beforeAll(() => {
            jsonDataFromFileService = null;
            favourites.clear();
        });

        it("saves to local storage", () => {
            expect(localFileStorageSpy.set).toHaveBeenCalledTimes(1);
            expect(jsonFilename).toEqual("myaccount.westus.batch.com.pinned");
            expect(favourites.size).toEqual(1);
        });

        it("saves correct data", () => {
            const savedData = getSavedData();
            expect(savedData.length).toEqual(1);
            expect(savedData[0].id).toEqual("my-job-matt");
        });

        it("won't insert multiple copies", () => {
            expect(localFileStorageSpy.set).not.toHaveBeenCalled();
        });

        it("fixes empty url", () => {
            pinService.pinFavorite(new BatchApplication({
                id: "new-one",
                url: "",
            }));

            expect(favourites.size).toEqual(2);
            expect(localFileStorageSpy.set).toHaveBeenCalledTimes(1);

            const savedData = getSavedData();
            expect(savedData.length).toEqual(2);
            expect(savedData[1].url).toEqual("https://myaccount.westus.batch.com/applications/new-one");
        });
    });

    describe("isFavorite", () => {
        let favorite: Job;
        beforeEach(() => {
            favorite = new Job({
                id: "my-pin",
            });

            pinService.pinFavorite(favorite);
        });

        beforeAll(() => {
            jsonDataFromFileService = null;
            favourites.clear();
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
        beforeEach(() => {
            favorite = new Job({
                id: "pin-2",
            });

            pinService.pinFavorite(favorite);
        });

        beforeAll(() => {
            jsonDataFromFileService = null;
            favourites.clear();
        });

        it("removes and saves if exists in list", () => {
            expect(favourites.size).toEqual(1);
            expect(localFileStorageSpy.set).toHaveBeenCalledTimes(1);

            pinService.unPinFavorite(favorite);
            expect(localFileStorageSpy.set).toHaveBeenCalledTimes(2);
            expect(favourites.size).toEqual(0);
        });

        it("does nothing if not favorite", () => {
            expect(localFileStorageSpy.set).toHaveBeenCalledTimes(1);
            const clone = Object.assign({ id: "pin-3", pinnableType: PinnedEntityType.Pool }, favorite);
            pinService.unPinFavorite(clone);

            expect(localFileStorageSpy.set).toHaveBeenCalledTimes(1);
        });
    });
});
