# GitHub Action to Install and Setup Zarf

Install a specific version of [Zarf](https://github.com/defenseunicorns/zarf) on a GitHub Actions runner.

## Usage

If you want to use/test this action, you will have to create your workflows in this same repository and use `./` in the `uses:` field as shown below. This is because it is in a private repository currently. You can view the [workflow in this repository](https://github.com/defenseunicorns/github-javascript-actions/blob/main/.github/workflows/setup-zarf.yml) as an example.

```yaml
- uses: ./
  with:
     version: '<version>'
     initPackage: true
```

Once the action is ready to be released publicly, it would be referenced as such:

```yaml
- uses: defenseunicorns/setup-zarf@v1
  with:
     version: '<version>'
     initPackage: true
```

## Inputs

| Inputs         | Required     | Values |
|:--------------:|:-----------:|:------------:|
| version        | No          |Semver version (e.g., `0.22.0`)|
| initPackage    | No          |true/false    |

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

### Lint

This project utilizes a static code analysis tool called [eslint](https://eslint.org/).

### Package Scripts

When changes are made to the javascript source code, run `npm run all` to execute `eslint` against the code and recompile the code into the `dist/index.js` file.

Ideally, this would be executed as a pre-commit hook, or in CI in the future.

&nbsp;
