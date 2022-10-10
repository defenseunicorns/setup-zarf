// External packages
const core = require('@actions/core');
const tc = require('@actions/tool-cache');

// Node.js core packages
const fs = require('fs');
const os = require('os');
const path = require('path');

// Internal packages
const { getZarf } = require('./lib/get-zarf');

async function setupZarf() {
  try {
    // Get version of zarf from user input
    const version = core.getInput('version');

    // Set the path where the zarf binary will be installed
    const homeDirectory = os.homedir()
    const binPath = '.zarf/bin/zarf'
    const installPath = path.join(homeDirectory, binPath);
    core.info(`Zarf will be installed at ${installPath}`);

    // Download the specified version of zarf
    const download = getZarf(version);
    const zarfDownloadURL = download.url
    core.info('Downloading the Zarf binary...')
    const pathToBinary = await tc.downloadTool(zarfDownloadURL, installPath);
    core.info(`Successfully downloaded ${zarfDownloadURL}`);
    core.info(`Zarf binary is at ${pathToBinary}`);

    // Add write/execute permissions to the binary file
    core.info('Adding write/execute permisions to the binary file...')
    fs.chmodSync(pathToBinary, '300')

    // Cache the zarf binary
    core.info('Caching the zarf binary...')
    const cachedPath = await tc.cacheFile(pathToBinary, 'zarf', 'zarf', version)

    // Expose the zarf binary by adding it to the $PATH environment variable
    core.info('Adding the cached zarf path to the $PATH...')
    core.addPath(cachedPath);

  } catch(error) {
      core.setFailed(error)
  }
}

setupZarf();