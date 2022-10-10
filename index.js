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
    const installPath = path.join(homeDirectory, ".zarf/bin/zarf");
    core.info(`Zarf will be installed at ${installPath}`);

    // Download the specified version of zarf
    const download = getZarf(version);
    const zarfDownloadURL = download.url
    core.info('Downloading the Zarf binary...')
    const pathToBinary = await tc.downloadTool(zarfDownloadURL, installPath);
    core.info(`Successfully downloaded ${zarfDownloadURL}`);
    core.info(`Zarf binary is at ${pathToBinary}`);

    // Adding permissions for the caching operation (may only need write permissions?)
    core.info('Adding permisions to the binary file so that we can move it into the tool cache directory...')
    fs.chmodSync(pathToBinary, '777')

    // Cache the zarf binary
    core.info('Caching the zarf binary...')
    const cachedPath = await tc.cacheFile(pathToBinary, 'zarf', 'zarf', version)

    // Adding permissions to the zarf binary at the cached path
    core.info('Adding permissions to the binary at the cached path so that it can be executed...')
    fs.chmodSync(cachedPath, '777')

    // Expose the zarf binary by adding it to the $PATH environment variable
    core.info('Adding the cached zarf path to the $PATH...')
    core.addPath(cachedPath);

  } catch(error) {
      core.setFailed(error)
  }
}

setupZarf();