# GitHub Action to Install and Setup Zarf

Install a specific version of [Zarf](https://github.com/defenseunicorns/zarf) on a GitHub Actions runner.

## Usage

If you want to use/test this action, you will have to create your workflows in this same repository and use `./` in the `uses:` field as shown below. This is because it is in a private repository currently. You can view the [workflow in this repository](https://github.com/defenseunicorns/github-javascript-actions/blob/main/.github/workflows/setup-zarf.yml) as an example.

```yaml
- uses: ./
  with:
     version: '<version>' # default is 0.21.3
```


Once the action is ready to be released publicly, it would be referenced as such:

```yaml
- uses: defenseunicorns/setup-zarf@v1
  with:
     version: '<version>' # default is 0.21.3
```

## Inputs

Currently, the only available input that can be passed in from a user is the version of `zarf` to install.

This is not a required input, and will install whatever the default is set to in the [action.yml](https://github.com/defenseunicorns/github-javascript-actions/blob/main/action.yml) file.

## Contributing

### Prerequisites

- [Node.js LTS](https://nodejs.org/en/download/) (comes with `npm`)

### Dependencies

To install this project's dependencies, navigate to the root of the repository and run:

```shell
npm ci
```

### Build

This project utilizes a tool called [ncc](https://github.com/vercel/ncc) to compile the code and all of it's dependencies into a single file, `dist/index.js`.

When changes are made to the javascript source code, be sure to run `npm run build` to recompile the code into the `dist/index.js` file. This will execute the build script (`ncc build`) found in the `package.json` file in the root of the repository.
