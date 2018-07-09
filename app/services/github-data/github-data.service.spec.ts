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
            settingsObs: new BehaviorSubject({ "github-data.source.branch": "master" }),
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
        });

        tick();
        expect(readySpy).toHaveBeenCalledOnce();
    }));

    it("download, unzip and save sync settings", (done) => {
        githubDataService.init();
        const zipFile = path.join("path/to/temp", "batch-labs-data.zip");
        const downloadDir = path.join("path/to/temp", "batch-labs-data");
        githubDataService.ready.subscribe(() => {
            expect(fsSpy.download).toHaveBeenCalledOnce();
            expect(fsSpy.download).toHaveBeenCalledWith(
                "https://github.com/Azure/BatchLabs-data/archive/master.zip",
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
            expect(data.source).toEqual("https://github.com/Azure/BatchLabs-data/archive/master.zip");
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
            "https://raw.githubusercontent.com/Azure/BatchLabs-data/master/some/file/on/github.json");
        response.flush(`{some: "content"}`);
    });
});
