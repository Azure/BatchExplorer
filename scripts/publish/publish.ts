import { exec } from "child_process";
import "colors";
import { ask } from "yesno";
import { getMilestone } from "./github-api";

const githubToken = process.env.GH_TOKEN;
const allMessages = [];
const repoName = "Azure/BatchLabs";

function log(text: string) {
    allMessages.push(text);
    // tslint:disable-next-line:no-console
    console.log(text);
}

function failure(message: string) {
    log(`✘ ${message}`.red);
}

function success(message: string) {
    log(`✔ ${message}`.green);
}

async function run(command: string): Promise<{ stdout: string, stderr: string }> {
    return new Promise<{ stdout: string, stderr: string }>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve({ stdout, stderr });
        });
    });
}

function checkGithubToken() {
    if (!githubToken) {
        failure("GH_TOKEN environment variable is not set."
            + "Please create a new env var with a github token to use the github api");
    }
    success("GH_TOKEN has a github token");
}

/**
 * This goes back to master and pull
 */
async function gotoMaster() {
    await run("git checkout master");
    await run("git pull");
    success("Checkout to master branch and pulled latest");
}

async function loadMillestone(millestoneId: number) {
    return getMilestone(repoName, millestoneId);
}

async function getCurrentBranch(): Promise<string> {
    const { stdout } = await run(`git symbolic-ref --short -q HEAD`);
    return stdout.trim();
}

function getMillestoneId() {
    if (process.argv.length < 3) {
        throw new Error("No millestone id was provided.");
    }
    return parseInt(process.argv[2], 10);
}

async function confirmVersion(version: string) {
    return new Promise((resolve, reject) => {
        ask(`Up program to be version ${version} (From millestone title) [Y/n]`, true, (ok) => {
            if (ok) {
                success(`A new release for version ${version} will be prepared`);
                resolve();
            } else {
                reject(new Error("Millestone version wasn't confirmed. Please change millestone title"));
            }
        });
    });
}

function getPreparationBranchName(version: string) {
    return `release/prepare-${version}`;
}

async function switchToNewBranch(branchName: string) {
    await run(`git checkout -b ${branchName}`);
    success(`Created a new branch ${branchName}`);
}

async function bumpVersion(version) {

}

async function startPublish() {
    checkGithubToken();
    const millestoneId = getMillestoneId();
    const millestone = await loadMillestone(millestoneId);
    const version = millestone.title;
    await confirmVersion(version);
    const releaseBranch = getPreparationBranchName(version);
    const branch = await getCurrentBranch();
    if (branch !== releaseBranch) {
        await gotoMaster();
        await switchToNewBranch(releaseBranch);
    }
}

startPublish().then(() => {
    success("First step of publishing is completed. Now wait for the pull request to complete.");
    process.exit(0);
}).catch((error) => {
    failure(error.message);
    process.exit(1);
});
