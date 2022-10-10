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

    // Set the destination path that the zarf binary will be downloaded to
    const destination = path.join(os.homedir(), ".zarf/bin/zarf");
    core.info(`Install destination is ${destination}`);

    // Download the specified version of zarf
    const download = getZarf(version);
    const pathToBinary = await tc.downloadTool(download.url, destination);
    core.debug(`Successfully downloaded ${download.url}`);
    core.debug(`Zarf binary is at ${pathToBinary}`);

    // Adding permissions for the caching operation (may only need write permissions?)
    fs.chmodSync(pathToBinary, '777')

    // Cache the zarf binary
    const cachedPath = await tc.cacheFile(pathToBinary, 'zarf', 'zarf', version)

    // Adding permissions to the zarf binary at the cached path
    fs.chmodSync(cachedPath, '777')

    // Expose the zarf binary by adding it to the PATH
    core.addPath(cachedPath);

  } catch(error) {
      core.setFailed(error)
  }
}

setupZarf();