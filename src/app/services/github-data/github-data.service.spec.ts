import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { BehaviorSubject } from "rxjs";
import { GithubDataService } from "./github-data.service";

describe("GithubDataService", () => {
    let githubDataService: GithubDataService;
    let httpMock: HttpTestingController;
    let settingsSpy;

    beforeEach(() => {
        settingsSpy = {
            settingsObs: new BehaviorSubject({
                "github-data.source.branch": "master",
                "github-data.source.repo": "Azure/BatchExplorer-data",
            }),
        };

        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
        });
        githubDataService = new GithubDataService(TestBed.get(HttpClient), settingsSpy);
        httpMock = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        githubDataService.ngOnDestroy();
    });

    it("#get gets remote file", (done) => {
        githubDataService.get("some/file/on/github.json").subscribe((result) => {
            expect(result).toEqual(`{some: "content"}`);
            done();
        });

        const response = httpMock.expectOne(
            "https://raw.githubusercontent.com/Azure/BatchExplorer-data/master/some/file/on/github.json");
        response.flush(`{some: "content"}`);
    });
});
