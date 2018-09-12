import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import * as path from "path";
import { BehaviorSubject } from "rxjs";
import { GithubDataService } from "./github-data.service";

describe("GithubDataService", () => {
    let githubDataService: GithubDataService;
    let httpMock: HttpTestingController;
    let fsSpy;
    let settingsSpy;

    beforeEach(() => {
        settingsSpy = {
            settingsObs: new BehaviorSubject({
                "github-data.source.branch": "master",
                "github-data.source.repo": "Azure/BatchExplorer-data",
            }),
        };

        fsSpy = {
            exists: () => Promise.resolve(false),
            commonFolders: { temp: "path/to/temp" },
            readFile: jasmine.createSpy("readFile"),
            download: jasmine.createSpy("download"),
            unzip: jasmine.createSpy("unzip"),
            saveFile: jasmine.createSpy("saveFile"),
        };
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
        });
        githubDataService = new GithubDataService(TestBed.get(HttpClient), fsSpy, settingsSpy);
        httpMock = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        githubDataService.ngOnDestroy();
    });

    it("is not ready until settings are loaded", fakeAsync(() => {
        settingsSpy.settingsObs.next({
            "github-data.source.branch": null,
        });
        const readySpy = jasmine.createSpy("ready");
        githubDataService.ready.subscribe(readySpy);
        githubDataService.init();

        tick();
        expect(readySpy).not.toHaveBeenCalled();
        settingsSpy.settingsObs.next({
            "github-data.source.branch": "master",
            "github-data.source.repo": "Azure/BatchExplorer-data",
        });

        tick();
        expect(readySpy).toHaveBeenCalledOnce();
    }));

    it("download, unzip and save sync settings", (done) => {
        githubDataService.init();
        const zipFile = path.join("path/to/temp", "batch-explorer-data.zip");
        const downloadDir = path.join("path/to/temp", "batch-explorer-data");
        githubDataService.ready.subscribe(() => {
            expect(fsSpy.download).toHaveBeenCalledOnce();
            expect(fsSpy.download).toHaveBeenCalledWith(
                "https://github.com/Azure/BatchExplorer-data/archive/master.zip",
                zipFile);
            expect(fsSpy.unzip).toHaveBeenCalledOnce();
            expect(fsSpy.unzip).toHaveBeenCalledWith(
                zipFile,
                downloadDir);
            expect(fsSpy.saveFile).toHaveBeenCalledOnce();
            expect(fsSpy.saveFile).toHaveBeenCalledWith(
                path.join(downloadDir, "sync.json"),
                jasmine.anything(),
            );
            const args = fsSpy.saveFile.calls.mostRecent().args;
            const data = JSON.parse(args[1]);
            expect(data.source).toEqual("https://github.com/Azure/BatchExplorer-data/archive/master.zip");
            expect(isNaN(Date.parse(data.lastSync))).toBe(false);
            done();
        });
    });

    it("#get gets remote file", (done) => {
        githubDataService.init();
        githubDataService.get("some/file/on/github.json").subscribe((result) => {
            expect(result).toEqual(`{some: "content"}`);
            done();
        });

        const response = httpMock.expectOne(
            "https://raw.githubusercontent.com/Azure/BatchExplorer-data/master/some/file/on/github.json");
        response.flush(`{some: "content"}`);
    });

    describe("#ready()", () => {
        it("only returns ready when not loading", fakeAsync(() => {
            const spy = jasmine.createSpy();
            githubDataService.ready.subscribe(spy);
            expect(spy).toHaveBeenCalledTimes(0);
            githubDataService.init();
            tick();
            expect(spy).toHaveBeenCalledTimes(1);

            const spy2 = jasmine.createSpy();
            githubDataService.ready.subscribe(spy2);
            expect(spy2).toHaveBeenCalledTimes(1);

        }));

        it("asking for ready while reloading data waits until loaded", fakeAsync(() => {
            const spy = jasmine.createSpy();
            githubDataService.reloadData();
            githubDataService.ready.subscribe(spy);
            expect(spy).toHaveBeenCalledTimes(0);
            tick();
            expect(spy).toHaveBeenCalledTimes(1);
        }));

        it("asking for ready after updating the settings which require a reload", fakeAsync(() => {
            const spy = jasmine.createSpy();
            githubDataService.init();
            tick();

            settingsSpy.settingsObs.next({
                "github-data.source.branch": "develop",
                "github-data.source.repo": "Azure/BatchExplorer-data",
            });
            githubDataService.ready.subscribe(spy);
            expect(spy).toHaveBeenCalledTimes(0);
            tick();
            expect(spy).toHaveBeenCalledTimes(1);
        }));
    });
});
