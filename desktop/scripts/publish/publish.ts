import { exec } from "child_process";
import "colors";
import * as fs from "fs";
import * as path from "path";
import * as yesno from "yesno";
import {
    createIssue, createPullRequest, getMilestone, githubToken, listMilestoneIssues, listPullRequests,
} from "./github-api";

const MAIN_BRANCH = "main";

const root = path.resolve(path.join(__dirname, "../../.."));
const allMessages: string[] = [];
const repoName = "Azure/BatchExplorer";
const newIssueBody = `
- [x] Update version in package.json
- [x] Update changelog
- [x] Update third party notices if needed
- [ ] Double check the prod build is working`;

function log(text: string) {
    allMessages.push(text);
    // eslint-disable no-console
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
        exec(command, { maxBuffer: 100_000_000 }, (error, stdout, stderr) => {
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
    } else {
        success("GH_TOKEN has a github token");
    }
}

/**
 * This goes back to the main branch and pulls the latest
 */
async function gotoMainBranch() {
    await run(`git checkout ${MAIN_BRANCH}`);
    await run("git pull");
    success(`Checkout to ${MAIN_BRANCH} branch and pulled latest`);
}

async function loadMilestone(milestoneId: number) {
    return getMilestone(repoName, milestoneId);
}

async function getCurrentBranch(): Promise<string> {
    const { stdout } = await run(`git symbolic-ref --short -q HEAD`);
    return stdout.trim();
}

function getMilestoneId() {
    if (process.argv.length < 3) {
        throw new Error("No milestone id was provided.");
    }
    return parseInt(process.argv[2], 10);
}

async function confirmVersion(version: string): Promise<void> {
    const ok = await yesno({
        question: `Bump to version ${version} (From milestone title) [Y/n]`,
        defaultValue: true
    });
    if (ok) {
        success(`A new release for version ${version} will be prepared`);
        return;
    }
    throw new Error("milestone version wasn't confirmed. Please change milestone title");
}

function calcNextVersion(version: string) {
    const match = /^(\d+\.)(\d+)(\.\d+)$/.exec(version);
    return `${match[1]}${parseInt(match[2], 10) + 1}${match[3]}`;
}

function getPreparationBranchName(version: string) {
    return `release/prepare-${version}`;
}

async function switchToNewBranch(branchName: string) {
    await run(`git checkout -B ${branchName}`);
    success(`Created a new branch ${branchName}`);
}

async function bumpVersion(version) {
    const currentBranch = await getCurrentBranch();
    const nextVersion = calcNextVersion(version);
    const bumpBranch = `release/bump-${nextVersion}`;
    await gotoMainBranch();
    await switchToNewBranch(bumpBranch);
    await run(`npm run version --no-git-tag-version --allow-same-version ${nextVersion}`);

    await run(`git commit -am "Bump version to ${nextVersion}"`);
    await run(`git push --set-upstream origin ${bumpBranch}`);
    await run(`git checkout "${currentBranch}"`);
    success(`Updated version in package.json to ${nextVersion} (branch: ${bumpBranch})`);
}

async function updateChangeLog(version, milestoneId) {
    const { stdout } = await run(`gh-changelog-gen --repo ${repoName} ${milestoneId} --formatter markdown`);
    const changelogFile = path.join(root, "CHANGELOG.md");
    const changelogContent = fs.readFileSync(changelogFile);

    if (changelogContent.indexOf(`## ${version}`) === -1) {
        fs.writeFileSync(changelogFile, `${stdout}\n${changelogContent}`);
        success("Added changes to the changelog");
    } else {
        success("Changelog already contains the changes for this version");
    }
}

async function updateThirdParty() {
    await run(`npm run ts scripts/lca/generate-third-party`);
    success("Updated ThirdPartyNotices.txt");
}

async function commitChanges() {
    await run(`git commit --allow-empty -am "Updated changelog and version."`);
}

async function push(branchName: string) {
    await run(`git push --set-upstream origin ${branchName}`);
}

async function createIssueIfNot(milestoneId, version) {
    const title = `Prepare for release of version ${version}`;
    const issues = await listMilestoneIssues(repoName, milestoneId);
    let issue = issues.filter(x => x.title === title)[0];
    if (issue) {
        success(`Issue was already created earlier ${issue.html_url}`);
    } else {
        issue = await createIssue(repoName, title, newIssueBody, milestoneId);
        success(`Created a new issue ${issue.html_url}`);
    }
    return issue;
}

async function createPullrequestIfNot(version, releaseBranch, issue) {
    const title = `Prepare for release ${version}`;
    const body = `fix #${issue.number}`;
    const prs = await listPullRequests(repoName, releaseBranch);
    let pr = prs[0];
    if (pr) {
        success(`There is already a pr created ${pr.html_url}`);
    } else {
        pr = await createPullRequest(repoName, title, body, releaseBranch);
        success(`Create a new pull request ${pr.html_url}`);
    }
    return pr;
}

async function buildApp() {
    // eslint-disable no-console
    console.log("Building the app with npm run build:package...");
    await run("npm run build:package");
    success("Build the app successfully. Starting it now, double check it is working correctly");
    await run(path.join(root, "release/win-unpacked/BatchExplorer.exe"));
}

async function startPublish() {
    checkGithubToken();
    const milestoneId = getMilestoneId();
    const milestone = await loadMilestone(milestoneId);
    if (!milestone.title && milestone["message"]) {
        throw new Error(`Error fetching milestone: ${milestone["message"]}`);
    }
    const version = milestone.title;
    await confirmVersion(version);
    const releaseBranch = getPreparationBranchName(version);
    const branch = await getCurrentBranch();
    if (branch !== releaseBranch) {
        await gotoMainBranch();
        await switchToNewBranch(releaseBranch);
    }
    await updateChangeLog(version, milestoneId);
    await updateThirdParty();
    await commitChanges();
    await push(releaseBranch);
    const issue = await createIssueIfNot(milestoneId, version);
    await createPullrequestIfNot(version, releaseBranch, issue);
    await buildApp();
    await bumpVersion(version);
}

startPublish().then(() => {
    success("First step of publishing is completed. Now wait for the pull request to complete.");
    process.exit(0);
}).catch((error) => {
    failure(error.message);
    process.exit(1);
});
