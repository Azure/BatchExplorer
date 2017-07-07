import { execCommand } from "../core";

let computedPythonPath: string = null;

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

/**
 * Try the given python path to see if it exists and is of a valid version.
 * @param pythonPath Path to the python executable
 * @returns Promise with the python path if it is a valid python environment or reject with the error.
 */
export function tryPython(pythonPath: string): Promise<string> {
    return execCommand(`${pythonPath} --version`).then(({ stdout }) => {
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

/**
 * Try a list of python paths sequentially. As soon as 1 valid path is found it resolve this one.
 * @param paths List of python executable paths.
 * @returns Promise that resolve the first valid path. If no path are valid reject with an error.
 */
export function tryMultiplePythons(paths: string[]): Promise<string> {
    let promise: Promise<string> = Promise.reject(null);
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

/**
 * Retrieve the python path that should be used for batch labs.
 * It will only look for the python executable on the first run. It will then used the cached value
 */
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

/**
 * Parse the version from the stdout
 * @param str Stdout of running python --version
 */
function parsePythonVersion(str: string) {
    const out = pythonVersionRegex.exec(str);

    if (!out || out.length < 2) {
        return null;
    } else {
        return out[1];
    }
}

/**
 * Check if the version is the right for batchlabs.
 * @param version Python version
 */
function isValidVersion(version: string) {
    return version.startsWith(pythonVersion);
}
