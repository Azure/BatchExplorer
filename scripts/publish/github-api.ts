import fetch from "node-fetch";
import { issuesUrl, milestoneIssuesUrl, milestoneUrl, pullRequestsUrl } from "./github-urls";
import { Issue, Milestone } from "./models";

export const githubToken = process.env.GH_TOKEN;
const headers = {
    Authorization: `token ${githubToken}`,
};

export async function get(url: string) {
    const response = await fetch(url, { headers });
    return response.json();
}

export async function post(url: string, body: any) {
    const response = await fetch(url, {
        method: "post",
        body: JSON.stringify(body),
        headers,
    });
    return response.json();
}

export async function getMilestone(repo: string, milestoneNumber: number): Promise<Milestone> {
    return await get(milestoneUrl(repo, milestoneNumber)) as any;
}

export async function listMilestoneIssues(repo: string, milestone: string | number): Promise<Issue[]> {
    return get(milestoneIssuesUrl(repo, milestone));
}

export async function createIssue(repo: string, title: string, description: string, milestoneId) {
    return post(issuesUrl(repo), {
        title,
        body: description,
        milestone: milestoneId,
    });
}

export async function listPullRequests(repo: string, source: string, target = "master"): Promise<Issue[]> {
    const url = `${pullRequestsUrl(repo)}?head=Azure:${source}&base=${target}`;
    return get(url);
}

export async function createPullRequest(repo: string, title: string, body: string, source: string, target = "master") {
    return post(pullRequestsUrl(repo), {
        title,
        body,
        head: source,
        base: target,
    });
}
