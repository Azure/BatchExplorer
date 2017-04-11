import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Constants } from "app/utils";

// Update branch to test before merging to master
const branch = "master";

const repoUrl = `${Constants.ServiceUrl.githubRaw}/Azure/BatchLabs-data/${branch}`;

@Injectable()
export class GithubDataService {
    constructor(private http: Http) { }

    public get(path: string) {
        return this.http.get(`${repoUrl}/${path}`);
    }
}
