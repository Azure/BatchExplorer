import { Platform } from "@batch-flask/utils";
import * as cp from "child_process";
import * as process from "process";
import { TerminalService } from "./terminal.service";

describe("TerminalService", () => {
    let terminalService: TerminalService;
    let osServiceSpy;
    let fsServiceSpy;
    let spawnTmp;
    let spawnSpy: jasmine.Spy;
    let platform: Platform;
    let isDebian;
    const envTemp = process.env;

    beforeEach(() => {
        spawnSpy = jasmine.createSpy("spawn").and.callFake((exe, args) => {
            return {
                pid: 1234,
                once: () => null,
            };
        });
        spawnTmp = cp.spawn;
        (cp as any).spawn = spawnSpy;
        osServiceSpy =  {
            platform: "",
            isWindows: () => platform === Platform.Windows,
            isLinux: () => platform === Platform.Linux ,
            isOSX: () => platform === Platform.OSX ,
        };
        fsServiceSpy = {
            exists: jasmine.createSpy("exists").and.callFake((filename) => {
                if (filename === "/etc/debian_version") {
                    return isDebian;
                } else {
                    return false;
                }
            }),
        };
        terminalService = new TerminalService(osServiceSpy, fsServiceSpy);
    });

    afterEach(() => {
        (cp as any).spawn = spawnTmp;
    });

    describe("when os is windows", () => {
        beforeEach(() => {
            platform = Platform.Windows;
        });

        it("should default to using powershell and launch in a new process", async () => {
            const pid = await terminalService.runInTerminal("echo hello");
            expect(typeof pid).toBe("number");
            expect(pid).toBe(1234);
            expect(spawnSpy).toHaveBeenCalledTimes(1);
            const spawnArgs = spawnSpy.calls.mostRecent().args;
            expect(spawnArgs.length).toBe(3);
            expect(spawnArgs[0]).toBe("cmd.exe");
            expect(spawnArgs[1]).toEqual(["/c", "start", "powershell", "-NoExit", "-Command", "echo hello"]);
        });

        it("should launch powershell in a new node process", async () => {
            const pid = await terminalService.runInTerminal("echo hello", "powershell");
            expect(typeof pid).toBe("number");
            expect(pid).toBe(1234);
            expect(spawnSpy).toHaveBeenCalledTimes(1);
            const spawnArgs = spawnSpy.calls.mostRecent().args;
            expect(spawnArgs.length).toBe(3);
            expect(spawnArgs[0]).toBe("cmd.exe");
            expect(spawnArgs[1]).toEqual(["/c", "start", "powershell", "-NoExit", "-Command", "echo hello"]);
        });

        it("should launch cmd in a new node process", async () => {
            const pid = await terminalService.runInTerminal("echo hello", "cmd");
            expect(typeof pid).toBe("number");
            expect(pid).toBe(1234);
            expect(spawnSpy).toHaveBeenCalledTimes(1);
            const spawnArgs = spawnSpy.calls.mostRecent().args;
            expect(spawnArgs.length).toBe(3);
            expect(spawnArgs[0]).toBe("cmd.exe");
            expect(spawnArgs[1]).toEqual(["/c", "start", "cmd", "/k", "echo hello"]);
        });
    });

    describe("when os is linux", () => {
        beforeEach(() => {
            platform = Platform.Linux;
            isDebian = false;
        });

        afterEach(() => {
            // revert the process.env variables to ensure all tests start with same variables
            delete process.env.DESKTOP_SESSION;
            delete process.env.COLORTERM;
            delete process.env.TERM;
            Object.assign(process.env, envTemp);
        });

        it("should default to using x-terminal-emulator for debian and launch", async () => {
            isDebian = true;
            const pid = await terminalService.runInTerminal("echo hello");
            expect(typeof pid).toBe("number");
            expect(pid).toBe(1234);
            expect(spawnSpy).toHaveBeenCalledTimes(1);
            const spawnArgs = spawnSpy.calls.mostRecent().args;
            expect(spawnArgs.length).toBe(3);
            expect(spawnArgs[0]).toBe("x-terminal-emulator");
            expect(spawnArgs[1]).toEqual(["-e", "echo hello; bash"]);
        });

        it("should default to using gnome-terminal for gnome and launch", async () => {
            process.env.DESKTOP_SESSION = "gnome";
            const pid = await terminalService.runInTerminal("echo hello");
            expect(typeof pid).toBe("number");
            expect(pid).toBe(1234);
            expect(spawnSpy).toHaveBeenCalledTimes(1);
            const spawnArgs = spawnSpy.calls.mostRecent().args;
            expect(spawnArgs.length).toBe(3);
            expect(spawnArgs[0]).toBe("gnome-terminal");
            expect(spawnArgs[1]).toEqual(["-e", "echo hello; bash"]);
        });

        it("should default to using konsole for kde-plasma and launch", async () => {
            process.env.DESKTOP_SESSION = "kde-plasma";
            const pid = await terminalService.runInTerminal("echo hello");
            expect(typeof pid).toBe("number");
            expect(pid).toBe(1234);
            expect(spawnSpy).toHaveBeenCalledTimes(1);
            const spawnArgs = spawnSpy.calls.mostRecent().args;
            expect(spawnArgs.length).toBe(3);
            expect(spawnArgs[0]).toBe("konsole");
            expect(spawnArgs[1]).toEqual(["-e", "echo hello; bash"]);
        });

        it("should use the default colorterm if necessary and launch", async () => {
            process.env.COLORTERM = "xterm-256color";
            const pid = await terminalService.runInTerminal("echo hello");
            expect(typeof pid).toBe("number");
            expect(pid).toBe(1234);
            expect(spawnSpy).toHaveBeenCalledTimes(1);
            const spawnArgs = spawnSpy.calls.mostRecent().args;
            expect(spawnArgs.length).toBe(3);
            expect(spawnArgs[0]).toBe("xterm-256color");
            expect(spawnArgs[1]).toEqual(["-e", "echo hello; bash"]);
        });

        it("should default to using xterm if non-debian ubuntu and launch", async () => {
            delete process.env.COLORTERM;
            delete process.env.TERM;
            const pid = await terminalService.runInTerminal("echo hello");
            expect(typeof pid).toBe("number");
            expect(pid).toBe(1234);
            expect(spawnSpy).toHaveBeenCalledTimes(1);
            const spawnArgs = spawnSpy.calls.mostRecent().args;
            expect(spawnArgs.length).toBe(3);
            expect(spawnArgs[0]).toBe("xterm");
            expect(spawnArgs[1]).toEqual(["-e", "echo hello; bash"]);
        });
    });

    describe("when os is macOS", () => {
        beforeEach(() => {
            platform = Platform.OSX;
        });

        it("should default to using Terminal.app and launch in a new process", async () => {
            const pid = await terminalService.runInTerminal("echo hello");
            expect(typeof pid).toBe("number");
            expect(pid).toBe(1234);
            expect(spawnSpy).toHaveBeenCalledTimes(1);
            const spawnArgs = spawnSpy.calls.mostRecent().args;
            expect(spawnArgs.length).toBe(3);
            expect(spawnArgs[0]).toBe("osascript");
            expect(spawnArgs[1]).toEqual([
                "-e",
                'tell application "Terminal" to do script "echo hello"',
                "-e",
                'tell application "Terminal" to activate',
            ]);
        });
    });
});
