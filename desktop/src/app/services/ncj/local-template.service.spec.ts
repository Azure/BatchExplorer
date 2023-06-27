import { NcjTemplateType } from "app/models";
import * as path from "path";
import { of } from "rxjs";
import { LocalTemplateFolder, LocalTemplateService } from "./local-template.service";

const source0 = { name: "My library", path: "/some/local/path/library1" };
const source1 = { name: "My lib 1", path: "/custom/path/lib1" };
const source2 = { name: "My lib 2", path: "/custom/path/lib2" };

describe("LocalTemplateService", () => {
    let service: LocalTemplateService;
    let fsSpy;
    let userConfigurationSpy;
    let sources: LocalTemplateFolder[] = null;

    beforeEach(async () => {
        userConfigurationSpy = {
            get: jasmine.createSpy("userConfigurationSpy.get").and.returnValue({
                sources: [source0, source1],
            }),
            set: jasmine.createSpy("userConfigurationSpy.set").and.returnValue(of(null)),
        };
        fsSpy = {
            glob: jasmine.createSpy("fs.glob").and.returnValue(Promise.resolve([
                "/custom/path/lib1/job1.job.template.json",
                "/custom/path/lib1/pool1.pool.template.json",
            ])),
        };

        service = new LocalTemplateService(userConfigurationSpy, fsSpy);
        service.sources.subscribe(x => sources = x);
        await Promise.resolve();
    });

    it("Loaded the sources", () => {
        expect(sources).toEqual([source0, source1]);
    });

    it("add a source to the list", (done) => {
        service.addSource(source2).subscribe(() => {
            const newSources = [source0, source1, source2];
            expect(userConfigurationSpy.set).toHaveBeenCalledOnce();
            expect(userConfigurationSpy.set)
                .toHaveBeenCalledWith("localTemplates", { sources: newSources });
            expect(sources).toEqual(newSources);
            done();
        });
    });

    it("remove a source to the list", (done) => {
        service.removeSource(source0.path).subscribe(() => {
            const newSources = [source1];
            expect(userConfigurationSpy.set).toHaveBeenCalledOnce();
            expect(userConfigurationSpy.set)
                .toHaveBeenCalledWith("localTemplates", { sources: newSources });
            expect(sources).toEqual(newSources);
            done();
        });
    });

    it("set the sources", (done) => {
        const newSources = [source2, source0];
        service.setSources(newSources).subscribe(() => {
            expect(userConfigurationSpy.set).toHaveBeenCalledOnce();
            expect(userConfigurationSpy.set)
                .toHaveBeenCalledWith("localTemplates", { sources: newSources });
            expect(sources).toEqual(newSources);
            done();
        });
    });

    it("navigate a source", async () => {
        const navigator = service.navigate(source1);
        const files = await navigator.listAllFiles().toPromise();
        expect(fsSpy.glob).toHaveBeenCalledOnce();
        expect(fsSpy.glob).toHaveBeenCalledWith(path.join(source1.path, "**/*.json"));
        expect(files.toJS()).toEqual([
            {
                name: "job1.job.template.json",
                url: "file:///custom/path/lib1/job1.job.template.json",
                properties: { contentLength: null, lastModified: null, creationTime: null, contentType: null },
                isDirectory: false,
            },
            {
                name: "pool1.pool.template.json",
                url: "file:///custom/path/lib1/pool1.pool.template.json",
                properties: { contentLength: null, lastModified: null, creationTime: null, contentType: null },
                isDirectory: false,
            },
        ]);
    });

    describe("#parseNcjTemplate", () => {
        it("parse a job template", () => {
            const jobTemplate = {
                parameters: {
                    id: {
                        type: "string",
                    },
                },
                job: {
                    id: "foo_1",
                },
                metadata: {
                    description: "Fake template",
                },
            };
            const { type, template } = service.parseNcjTemplate(JSON.stringify(jobTemplate));
            expect(type).toEqual(NcjTemplateType.Job);
            expect(template).toEqual(jobTemplate);
        });

        it("parse a pool template", () => {
            const poolTemplate = {
                parameters: {
                    id: {
                        type: "string",
                    },
                },
                pool: {
                    id: "foo_1",
                },
                metadata: {
                    description: "Fake pool template",
                },
            };
            const { type, template } = service.parseNcjTemplate(JSON.stringify(poolTemplate));
            expect(type).toEqual(NcjTemplateType.Pool);
            expect(template).toEqual(poolTemplate);
        });
    });

});
