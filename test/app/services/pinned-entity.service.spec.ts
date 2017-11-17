import { List } from "immutable";
import { Observable, Subscription } from "rxjs";

import { PinnedEntity, PinnedEntityType } from "app/models";
import { PinnedEntityService } from "app/services";
import * as Fixtures from "test/fixture";

let jsonDataFromFileService: any;
function getSavedData(): PinnedEntity[] {
    return List<PinnedEntity>(jsonDataFromFileService.map(x => new PinnedEntity(x))).toArray();
}

describe("PinnedEntityService", () => {
    let pinService: PinnedEntityService;
    let favourites: List<PinnedEntity> = List<PinnedEntity>();
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
            pinService.pinFavorite(Fixtures.pinnable.create({
                id: "my-job-matt",
                routerLink: ["/jobs", "my-job-matt"],
                pinnableType: PinnedEntityType.Job,
                url: "https://myaccount.westus.batch.com/jobs/my-job-matt",
            }));
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
            pinService.pinFavorite(Fixtures.pinnable.create({
                id: "new-one",
                routerLink: ["/applications", "new-one"],
                pinnableType: PinnedEntityType.Application,
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
        let favorite: PinnedEntity;
        beforeEach(() => {
            favorite = Fixtures.pinnable.create({
                id: "my-pin",
                pinnableType: PinnedEntityType.Job,
            });

            pinService.pinFavorite(favorite);
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

    // describe("unPinFavorite", () => {
    //     let favorite: PinnedEntity;
    //     beforeEach(() => {
    //         pinService.pinFavorite(Fixtures.pinnable.create({
    //             id: "pin-2",
    //             pinnableType: PinnedEntityType.Job,
    //         });
    //     });

    //     it("removes and saves if exists in list", () => {
    //         pinService.pinFavorite(favorite).subscribe(() => {
    //             console.log("COUNT: ", favourites.size);
    //             expect(favourites.size).toEqual(1);
    //             pinService.unPinFavorite(favorite);
    //             expect(localFileStorageSpy.set).toHaveBeenCalledTimes(1);
    //             expect(favourites.size).toEqual(0);
    //         });
    //     });

    //     it("does nothing if not favorite", () => {
    //         const clone = Object.assign({ id: "pin-3", pinnableType: PinnedEntityType.Pool }, favorite);
    //         expect(clone.id).toEqual("my-pin");
    //         expect(clone.pinnableType).toEqual(PinnedEntityType.Pool);
    //         expect(pinService.isFavorite(clone)).toEqual(false);
    //     });
    // });
});
