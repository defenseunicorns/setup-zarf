const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const io = require('@actions/io');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { isObject } = require('util');
const { getZarf } = require('./lib/utils');

async function setupZarf() {
  try {
    // Get version of zarf to be installed
    const version = core.getInput('version');

    const destination = path.join(os.homedir(), ".zarf/bin/zarf");
    core.info(`Install destination is ${destination}`);

    // Download the specified version of zarf
    const download = getZarf(version);
    const pathToBinary = await tc.downloadTool(download.url, destination);
    core.debug(`Successfully downloaded ${download.url}`);
    core.debug(`Zarf binary is at ${pathToBinary}`);

    // Cache the zarf binary
    const cachedPath = await tc.cacheFile(pathToBinary, 'zarf', 'zarf', version)

    // Set executable permission for the zarf binary
    fs.chmodSync(cachedPath, '777')

    // Expose the zarf binary by adding it to the PATH
    core.addPath(cachedPath);

    // // Execute the zarf binary
    // await exec.exec(pathToBinary);

  } catch(error) {
      core.setFailed(error)
  }
}

setupZarf();