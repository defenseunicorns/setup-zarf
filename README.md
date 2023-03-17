# GitHub Action to Install and Setup Zarf

Make [Zarf](https://github.com/defenseunicorns/zarf) available to your GitHub Actions workflows.

This action will optionally download a Zarf init package. To learn more about Zarf init packages and their use-cases, see the [Zarf docs](https://docs.zarf.dev/docs/user-guide/zarf-packages/the-zarf-init-package).

## Usage

```yaml
uses: defenseunicorns/setup-zarf@v1
with:
  version: <version> # Optional. Defaults to latest.
  download-init-package: true # Optional. Defaults to false.
```

## Example Package Create

```yaml
jobs:
  create_pacakge:
    runs-on: ubuntu-latest

    name: Create my cool Zarf Package
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 1

      - name: Install Zarf
        uses: defenseunicorns/setup-zarf@v1
        with:
          version: v0.24.3

      - name: Create the package
        run: zarf package create --confirm
```

## Complete example: package create, cluster init, package deploy

```yaml
jobs:
  deploy_package:
    runs-on: ubuntu-latest

    name: Create & deploy my cool Zarf Package
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 1

      - name: Install Zarf
        uses: defenseunicorns/setup-zarf@v1
        with:
          version: v0.24.3
          download-init-package: true

      - name: Create the package
        run: zarf package create --confirm

      - name: Create a k3d cluster
        run: |
          curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
          k3d cluster delete && k3d cluster create

      - name: Initialize the cluster
        run: zarf init --confirm

      - name: Deploy the package
        run: zarf deploy --confirm

      - name: View the deployed package
        run: zarf package list
```

#

## Inputs

### version

- Optional
- Default: latest release
- **_Note:_** Include the `v` in your version (e.g., `v0.24.3`)
- Check out the [Zarf releases page](https://github.com/defenseunicorns/zarf/releases) to see available versions

### download-init-package

- Optional
- Default: `false`
