import { execCommand } from "../core";
import { logger } from "../logger";

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
    const errors = {};
    if (paths.length === 0) {
        return Promise.reject({});
    }
    const firstPath = paths[0];

    return tryPython(firstPath).then(() => {
        return firstPath;
    }).catch((error) => {
        return tryMultiplePythons(paths.slice(1)).catch((errors) => {
            return Promise.reject({
                ...errors,
                [firstPath]: error,
            });
        });
    });
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
    }).catch((errors) => {
        let msg = "Fail to find a valid python 3.6 installation:";
        for (let path of Object.keys(errors)) {
            msg += `\n  - ${path}: ${errors[path].message}`;
        }
        logger.error(msg);
        return null;
    });
}

const pythonVersionRegex = /Python\s*(\d+)\.(\d+)\.(\d+)/;

export interface SemVersion {
    major: number;
    minor: number;
    patch: number;
}
/**
 * Parse the version from the stdout
 * @param str Stdout of running python --version
 */
function parsePythonVersion(str: string): SemVersion {
    const out = pythonVersionRegex.exec(str);

    if (!out || out.length < 4) {
        return null;
    } else {
        return {
            major: parseInt(out[1], 10),
            minor: parseInt(out[2], 10),
            patch: parseInt(out[3], 10),
        };
    }
}

/**
 * Check if the version is the right for batchlabs.
 * @param version Python version
 */
function isValidVersion(version: SemVersion) {
    return version.major === 3 && version.minor >= 5;
}
