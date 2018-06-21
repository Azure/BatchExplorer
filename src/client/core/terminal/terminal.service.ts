export interface TerminalService {
    runInTerminal(args: string[], cwd: string, env: StringMap<string>): Promise<any>;
}
