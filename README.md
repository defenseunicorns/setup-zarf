# GitHub Action to Install and Setup Zarf

Install a specific version of [Zarf](https://github.com/defenseunicorns/zarf) on a GitHub Actions runner.

Optionally, this action will download a zarf init package for you and set it up for `zarf init` to execute against it.

## Experimental ⚠️

This GitHub action is considered experimental because of its early-stage development and lack of proper tests in place yet.

There may be frequent breaking changes to the `main` branch in this stage of development.

## Usage

```yaml
uses: defenseunicorns/setup-zarf@main
with:
  version: '<version>' # Optional, accepts a semantic version string
  download-init-package: true # Required, accepts true or false
```

## Inputs

### version

- Optional
- If left unset, it will download the default version in the [action.yml](https://github.com/defenseunicorns/github-javascript-actions/blob/main/action.yml)
- ***Note:*** Include the `v` in your version (e.g., `v0.22.2`)
- Check out the [Zarf releases page](https://github.com/defenseunicorns/zarf/releases) to see available versions

### download-init-package

- Required
- To learn more about Zarf init packages and their use-cases, see the [Zarf docs](https://docs.zarf.dev/docs/user-guide/zarf-packages/the-zarf-init-package)


| Input                 | Required | Values          | Type    |
|:---------------------:|:--------:|:---------------:|:-------:|
| version               | No       |e.g., `v0.22.2`  | String  |
| download-init-package | Yes      |`true` or `false`| Boolean |

## Contributing

### Prerequisites

- [Node.js LTS](https://nodejs.org/en/download/) (comes with `npm`)

### Dependencies

To install this project's dependencies, navigate to the root of the repository and run:

```shell
npm ci
```

### Build

This project utilizes a tool called [ncc](https://github.com/vercel/ncc) to compile the code and all of its dependencies into a single file, `dist/index.js`.

### Lint

This project utilizes a static code analysis tool called [eslint](https://eslint.org/).

### Package Scripts

When changes are made to the javascript source code, run `npm run all` to execute `eslint` against the code and recompile the code into the `dist/index.js` file.

Ideally, this would be executed as a pre-commit hook, or in CI in the future.

&nbsp;
