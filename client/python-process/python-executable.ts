import { exec } from "child_process";

let computedPythonPath: string = null;
export function execPromise(command: string) {
    return new Promise((resolve, reject) => {
        exec(command, (error: string, stdout: string, stderr: string) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

export class PythonExecutableError extends Error {
    constructor(public message) {
        super();
    }
}

export class PythonExecutableNotFoundError extends PythonExecutableError {
    constructor(public executable) {
        super(`Python exec "${executable}" is not found.`);
    }
}

export function tryPython(pythonPath: string) {
    return execPromise(`${pythonPath} --version`).then(({ stdout }) => {
        const pythonVersion = parsePythonVersion(stdout);
        if (!pythonVersion) {
            throw new PythonExecutableError(`Could not parse python version from string ${stdout}`);
        }
        if (!isValidVersion(pythonVersion)) {
            throw new PythonExecutableError(`Python version is not valid please install python >= 3.6`);
        }
        return pythonPath;
    }).catch((error) => {
        return Promise.reject(new PythonExecutableNotFoundError(pythonPath));
    });
}

export function tryMultiplePythons(paths: string[]): Promise<string> {
    let promise = Promise.reject(null);
    const errors = {};

    for (let path of paths) {
        promise = promise.catch((error) => {
            errors[path] = error;
            return tryPython(path);
        }).then(() => {
            return path;
        });
    }
    return promise;
}

export function getPythonPath(): Promise<string> {
    if (computedPythonPath) {
        return Promise.resolve(computedPythonPath);
    }
    const envPython = process.env.BL_PYTHON_PATH;
    return tryMultiplePythons([envPython, "python3", "python"].filter(x => Boolean(x))).then((path) => {
        computedPythonPath = path;
        return path;
    });
}

const pythonVersionRegex = /Python\s*([\d.]+)/;
const pythonVersion = "3.6";

function parsePythonVersion(str: string) {
    const out = pythonVersionRegex.exec(str);

    if (!out || out.length < 2) {
        return null;
    } else {
        return out[1];
    }
}

function isValidVersion(version: string) {
    return version.startsWith(pythonVersion);
}
