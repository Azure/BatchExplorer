# New release

## Prerequistie: Millestone
Every release should have a millestone with the list of issues fixed in that new version.

You can use the command `npm run publish -- <millestoneid>` to do step 1&2 and skip to step 3

## Step 1: Create a release issue

Create a new issue in the millestone with the title `Prepare version x.y.z` and the following description:

```md
- [ ] Update version in package.json
- [ ] Update changelog
- [ ] Update third party notices if needed
- [ ] Double check the prod build is working
```

This will help with tracking the required task for a new release.

## Step 2: Perform above task

Create a branch called release/prepare-<milestone>, i.e. release/prepare-0.10.0

#### Update version in package.json

This is quite straightforward. Just change the following line to have the version wanted

```json
{
    ...
    "version": "0.2.0",
    ...
}
```

#### Update the changelog

This is a bit more tedious as it require looking at the millestone completed and writing a reable changelog for the user of batch labs.
This should be targeted at user and not developper which means there is no need to include internal issues and refactoring work.
Describe what functionality changed in the app with a link to the issue.

Example:
```md
* Added this awesome thing in the pool details [\#123](https://github.com/Azure/BatchLabs/issues/123)
```

**Note:** There is now a utility to generate the change log for a millestone also so you don't have to write it manually.
[https://www.npmjs.com/package/github-changelog-gen](https://www.npmjs.com/package/github-changelog-gen)


#### Update third party notices
Running the following command will update any required third party notices.
```
npm run ts scripts/lca/generate-third-party
```

**Important:** Make sure you have an environment variable called GH_TOKEN set that contains a valid GitHub API auth token.
You can manage and setup personal access tokens here: [https://github.com/settings/tokens](https://github.com/settings/tokens)

If you see an error like the following while executing the 'generate-third-party' script:
```
const value = match[1];
                    ^
TypeError: Cannot read property '1' of null
```

This probably means that a dependancy in package.json has a differnt format to what we are expecting.
You will need to modify '\scripts\lca\generate-third-party.ts' in order to get it to work.

#### Double check the prod build is working

Travis should check on master that the build itself it not failing. However there could still be runtime errors that happens.
Do the following and test the application.
```
npm run build-and-pack
```


## Step: 3 Merge those changes
Create a PR against master with the changelog, package.json changes and reference the issue created in step 1(.i.e fix \#123).


## Step 4: Create a PR against stable.
Now create a pull request against stable. Wait for the CI to pass.

**Important:** DO NOT squash merge the changes.(Go in BatchLabs [settings](https://github.com/Azure/BatchLabs/settings) and renenable "Allow merge commits")
Then click on merge commit(Make sure it is not squash merge)

![](images/merge-commit.png)

All the commits in master should now be in stable with the merge commit.
Now disable the "Allow merge commit" again to prevent mistake when merging to master.

## Step 5: Publish the release
* Wait for the CI to test and build stable branch [Travis](https://travis-ci.org/Azure/BatchLabs/branches).
* Go to github [release](https://github.com/Azure/BatchLabs/releases).
* You should see a new draft release with the new version.
* Double check every platform executable and installer is present (exe, app, zip, dmg, deb, rpm).
* Download and install one of the versions to make sure it runs and validate that the Python server is correctly running by creating an empty file-group or kicking off an NCJ job.
* Copy the changelog(only for the version) in the description in MD format.
* Change the "Target: master" to "Target: stable" if applicable by the "create a new tag on publish".
* Click publish release (Mark as pre-release for now).
