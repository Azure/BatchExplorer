import * as path from "path";
import { GithubPortfolio } from "./github-portfolio";
import { PortfolioType } from "./portfolio";

describe("GithubPortfolio", () => {
    let portfolio: GithubPortfolio;
    let fsSpy;

    let syncFileExist: boolean;
    let lastSyncDate: Date;

    beforeEach(() => {
        lastSyncDate = new Date();
        syncFileExist = true;
        fsSpy = {
            commonFolders: {
                temp: "~/temp",
            },
            exists: jasmine.createSpy("exists").and.callFake(() => Promise.resolve(syncFileExist)),
            download: jasmine.createSpy("download").and.callFake(() => Promise.resolve()),
            unzip: jasmine.createSpy("download").and.callFake(() => Promise.resolve()),
            saveFile: jasmine.createSpy("saveFile").and.callFake(() => Promise.resolve()),
            readFile: jasmine.createSpy("readFile").and.callFake(() => Promise.resolve(JSON.stringify({
                lastSync: lastSyncDate, source: "https://github.com/my/portfolio/archive/master.zip",
            }))),
        };

    });

    function setup() {
        portfolio = new GithubPortfolio({
            id: "my-portfolio-1",
            source: "https://github/my/portfolio/tree/master",
            path: "templates",
            type: PortfolioType.Github,
        }, fsSpy);
        return portfolio.ready.toPromise();
    }

    it("parse when branch contains / (e.g. feature/foo)", async () => {
        portfolio = new GithubPortfolio({
            id: "my-portfolio-1",
            source: "https://github/my/portfolio/tree/feature/foo",
            path: "templates",
            type: PortfolioType.Github,
        }, fsSpy);
        await portfolio.ready.toPromise();

        const zipPath = path.join("~/temp/portfolios/zips/my-portfolio-1.zip");

        expect(fsSpy.download).toHaveBeenCalledWith(
            "https://github.com/my/portfolio/archive/feature/foo.zip",
            zipPath,
        );

        expect(portfolio.path).toEqual(path.join("~/temp/portfolios/my-portfolio-1/portfolio-feature-foo/templates"));
    });

    it("cache the data when no data exists", async () => {
        syncFileExist = false;

        await setup();

        expect(fsSpy.exists).toHaveBeenCalledOnce();
        expect(fsSpy.exists).toHaveBeenCalledWith(path.join("~/temp/portfolios/my-portfolio-1/sync.json"));

        expect(fsSpy.readFile).not.toHaveBeenCalled();

        const zipPath = path.join("~/temp/portfolios/zips/my-portfolio-1.zip");
        expect(fsSpy.download).toHaveBeenCalledOnce();
        expect(fsSpy.download).toHaveBeenCalledWith(
            "https://github.com/my/portfolio/archive/master.zip",
            zipPath,
        );

        const downloadPath = path.join("~/temp/portfolios/my-portfolio-1");

        expect(fsSpy.unzip).toHaveBeenCalledOnce();
        expect(fsSpy.unzip).toHaveBeenCalledWith(zipPath, downloadPath);

        expect(fsSpy.saveFile).toHaveBeenCalledOnce();
        expect(fsSpy.saveFile).toHaveBeenCalledWith(path.join("~/temp/portfolios/my-portfolio-1/sync.json"),
            jasmine.stringMatching(`{"source":"https://github.com/my/portfolio/archive/master.zip","lastSync":".*"}`));
    });

    it("cache the data when data is too old", async () => {
        lastSyncDate = new Date(2017, 1, 1);
        await setup();

        expect(fsSpy.exists).toHaveBeenCalledOnce();
        expect(fsSpy.exists).toHaveBeenCalledWith(path.join("~/temp/portfolios/my-portfolio-1/sync.json"));

        expect(fsSpy.readFile).toHaveBeenCalledOnce();
        expect(fsSpy.readFile).toHaveBeenCalledWith(path.join("~/temp/portfolios/my-portfolio-1/sync.json"));

        const zipPath = path.join("~/temp/portfolios/zips/my-portfolio-1.zip");
        expect(fsSpy.download).toHaveBeenCalledOnce();
        expect(fsSpy.download).toHaveBeenCalledWith(
            "https://github.com/my/portfolio/archive/master.zip",
            zipPath,
        );

        const downloadPath = path.join("~/temp/portfolios/my-portfolio-1");

        expect(fsSpy.unzip).toHaveBeenCalledOnce();
        expect(fsSpy.unzip).toHaveBeenCalledWith(zipPath, downloadPath);

        expect(fsSpy.saveFile).toHaveBeenCalledOnce();
        expect(fsSpy.saveFile).toHaveBeenCalledWith(path.join("~/temp/portfolios/my-portfolio-1/sync.json"),
            jasmine.stringMatching(`{"source":"https://github.com/my/portfolio/archive/master.zip","lastSync":".*"}`));
    });

    it("doesn't do anything if data is newer", async () => {
        lastSyncDate = new Date();
        await setup();

        expect(fsSpy.exists).toHaveBeenCalledOnce();
        expect(fsSpy.exists).toHaveBeenCalledWith(path.join("~/temp/portfolios/my-portfolio-1/sync.json"));

        expect(fsSpy.readFile).toHaveBeenCalledOnce();
        expect(fsSpy.readFile).toHaveBeenCalledWith(path.join("~/temp/portfolios/my-portfolio-1/sync.json"));

        // Doesn't download again
        expect(fsSpy.download).not.toHaveBeenCalled();
        expect(fsSpy.unzip).not.toHaveBeenCalled();
        expect(fsSpy.saveFile).not.toHaveBeenCalled();
    });

    it("force refresh", async () => {
        lastSyncDate = new Date();
        await setup();

        expect(fsSpy.exists).toHaveBeenCalledOnce();
        expect(fsSpy.readFile).toHaveBeenCalledOnce();

        // Doesn't download again
        expect(fsSpy.download).not.toHaveBeenCalled();
        expect(fsSpy.unzip).not.toHaveBeenCalled();
        expect(fsSpy.saveFile).not.toHaveBeenCalled();

        await portfolio.refresh().toPromise();

        const zipPath = path.join("~/temp/portfolios/zips/my-portfolio-1.zip");
        expect(fsSpy.download).toHaveBeenCalledOnce();
        expect(fsSpy.download).toHaveBeenCalledWith(
            "https://github.com/my/portfolio/archive/master.zip",
            zipPath,
        );

        const downloadPath = path.join("~/temp/portfolios/my-portfolio-1");

        expect(fsSpy.unzip).toHaveBeenCalledOnce();
        expect(fsSpy.unzip).toHaveBeenCalledWith(zipPath, downloadPath);

        expect(fsSpy.saveFile).toHaveBeenCalledOnce();
        expect(fsSpy.saveFile).toHaveBeenCalledWith(path.join("~/temp/portfolios/my-portfolio-1/sync.json"),
            jasmine.stringMatching(`{"source":"https://github.com/my/portfolio/archive/master.zip","lastSync":".*"}`));
    });
});
