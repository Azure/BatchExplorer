import fetch from "node-fetch";
import { issuesUrl, milestoneIssuesUrl, milestoneUrl } from "./github-urls";
import { Issue, Milestone } from "./models";

export async function get(url: string) {
    const response = await fetch(url);
    return response.json();
}

export async function post(url: string, body: any) {
    const response = await fetch(url, {
        method: "post",
        body: JSON.stringify(body),
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
    console.log("issues", issuesUrl(repo));
    return post(issuesUrl(repo), {
        title,
        body: description,
        millestone: milestoneId,
    });
}
