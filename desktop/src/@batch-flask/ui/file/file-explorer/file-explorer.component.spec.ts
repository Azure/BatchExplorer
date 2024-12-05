import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FileSystemService } from "@batch-flask/electron";
import { ActivityService } from "@batch-flask/ui/activity";
import { DialogService } from "@batch-flask/ui/dialogs";
import { Stats } from "fs";
import { FileExplorerComponent } from "./file-explorer.component";
import {
    ButtonsModule,
    DateModule,
    FileExplorerTabsComponent,
    FileTableViewComponent,
    FileTreeViewComponent,
    FileTreeViewRowComponent,
    FileViewerModule,
    LoadingModule,
    QuickListModule,
    TableModule,
    ToolbarModule
} from "@batch-flask/ui";
import { MaterialModule } from "@batch-flask/core";
import { RouterTestingModule } from "@angular/router/testing";
import { I18nTestingModule } from "@batch-flask/core/testing";
import { SplitPaneModule } from "@batch-flask/ui/split-pane";
import { FilePathNavigatorComponent } from "./file-table-view/file-path-navigator";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MockElectronRemote } from "@batch-flask/electron/testing";

describe("FileExplorerComponent", () => {
    let component: FileExplorerComponent;
    let fixture: ComponentFixture<FileExplorerComponent>;
    let fsService: jasmine.SpyObj<FileSystemService>;
    let dialogService: jasmine.SpyObj<DialogService>;
    let activityService: jasmine.SpyObj<ActivityService>;

    beforeEach(async () => {
        fsService = jasmine.createSpyObj("FileSystemService", ["lstat",
            "readdir"]);
        dialogService = jasmine.createSpyObj("DialogService", ["confirm"]);
        activityService = jasmine.createSpyObj("ActivityService", ["exec"]);

        const remoteSpy = new MockElectronRemote();

        await TestBed.configureTestingModule({
            imports: [
                ButtonsModule,
                MaterialModule,
                SplitPaneModule,
                FileViewerModule,
                RouterTestingModule,
                I18nTestingModule,
                ToolbarModule,
                LoadingModule,
                TableModule,
                DateModule,
                QuickListModule,
                FormsModule,
                ReactiveFormsModule
            ],
            declarations: [
                FileExplorerComponent,
                FileTreeViewComponent,
                FileTableViewComponent,
                FileExplorerTabsComponent,
                FilePathNavigatorComponent,
                FileTreeViewRowComponent
            ],
            providers: [
                { provide: FileSystemService, useValue: fsService },
                { provide: DialogService, useValue: dialogService },
                { provide: ActivityService, useValue: activityService },
                remoteSpy.asProvider(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(FileExplorerComponent);
        component = fixture.componentInstance;
    });

    it("should get files to upload including directory files", async () => {
        const base = "base/path";
        const files = [{ path: "local/dir", name: "dir" }];
        const dirFiles = ["file1.txt", "file2.txt"];

        fsService.lstat.and.returnValue(Promise.resolve({
            isFile: () => false, isDirectory: () => true
        } as Stats));
        fsService.readdir.and.returnValue(Promise.resolve(dirFiles));

        const result = await component["_getFilesToUpload"](base, files);

        expect(result).toEqual([
            {
                localPath: "local/dir/file1.txt",
                remotePath: "base/path/dir/file1.txt"
            },
            {
                localPath: "local/dir/file2.txt",
                remotePath: "base/path/dir/file2.txt"
            },
        ]);
    });
});
