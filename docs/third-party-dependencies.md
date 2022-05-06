# Third party dependencies

Each dependencies shipped with Batch Explorer must go through Microsoft open source approval. This include every new version of the same dependency. That mean every time you update a dependency you must request [here](https://ossmsft.visualstudio.com/DefaultCollection/_oss?searchText=p%3A%22BatchExplorer%22&_a=existing)

## Which dependencies needs to be approved

Any dependencies in the dependency list of the `package.json`. devDependencies are not required as they are not shipped.
It also include non dev dependencies in `python/requirements.txt`

There is also 2 more dependency which depends on what `travis` and `appveyor` build definition use(Don't ask for your local version). You must request approval accordingly

* `node`
* `python`

## ThirdPartyNotices.txt

Each of those depenencies needs to be referenced in the `ThirdPartyNotices.txt` with their own license file appened.
Fortunately there is a tool that will generate this file for you.

To generate the file run

```shell
npm run ts scripts/lca/generate-third-party
```

To check the current file is up to date(This is run on travis before mergin to stable)

```shell
npm run ts scripts/lca/generate-third-party -- --check
```
