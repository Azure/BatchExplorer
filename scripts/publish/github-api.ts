import fetch from "node-fetch";
import { milestoneIssuesUrl, milestoneUrl } from "./github-urls";
import { Issue, Milestone } from "./models";

export async function get(url: string) {
    const response = await fetch(url);
    const data = response.json();
    return data;
}

export async function getMilestone(repo: string, milestoneNumber: number): Promise<Milestone> {
    return await get(milestoneUrl(repo, milestoneNumber)) as any;
}

export async function listMilestoneIssues(repo: string, milestone: string | number): Promise<Issue[]> {
    return get(milestoneIssuesUrl(repo, milestone));
}
