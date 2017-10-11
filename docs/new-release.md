# New release

## Prerequistie: Millestone
Every release should have a millestone with the list of issues fixed in that new version.

## Step 1: Create a release issue

Create a new issue in the millestone with the title `Prepare version x.y.z` and the following description:

```mat
- [ ] Update version in package.json
- [ ] Update changelog
- [ ] Double check the prod build is working
```

This will help with tracking the required task for a new release.

## Step 2: Perform above task

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
```mat
* Added this awesome thing in the pool details [\#123](https://github.com/Azure/BatchLabs/issues/123)
```

#### Double check the prod build is working

Travis should check on master that the build itself it not failing. However there could still be runtime errors that happens.
Do the following and test the application.
```
npm run build:prod
npm run electron:prod
```


## Step: 3 Merge those changes
Create a PR against master with the changelog, package.json changes and reference the issue created in step 1(.i.e fix \#123).


## Step 4: Create a PR against stable.
Now create a pull request against stable. Wait for the CI to pass.

**Important:** DO NOT squash merge the changes.(Go in BatchLabs [settings](https://github.com/Azure/BatchLabs/settings) and renenable "Allow merge commits")
Then click on merge commit(Make sure it is not squash merge)
All the commits in master should now be in stable with the merge commit.
Now disable the "Allow merge commit" again to prevent mistake when merging to master.

## Step 5: Create a new github release

 * Go to github [release](https://github.com/Azure/BatchLabs/releases).
 * Click "Draft a new release".
 * Enter the version number in the tag and title
 * Copy the changelog(only for the version) in the description
