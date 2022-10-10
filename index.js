const core = require('@actions/core');
const exec = require('@actions/exec');
const tc = require('@actions/tool-cache');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { getZarfBinary } = require('./lib/utils');

async function setupZarf() {
  try {
    const download = getZarfBinary(version);

    // Get version of zarf to be installed
    const version = core.getInput('version');

    const destination = path.join(os.homedir(), ".zarf/bin");
    core.info(`Install destination is ${destination}`);

    // Download the specified version of zarf
    const pathToBinary = await tc.downloadTool(download.url, destination);
    core.debug(`Successfully downloaded ${download.url}`);

    // Set executable permission for the zarf binary
    fs.chmod(pathToBinary, 100, (error) => {

      if (error) {
        core.setFailed("Failed to add executable permission to zarf binary...")
      } else {
        core.info("Successfully added executable permission to zarf binary...");
      }
  
    });

    // Expose the zarf binary by adding it to the PATH
    core.addPath(pathToBinary);

    // Execute the zarf binary
    await exec.exec(pathToBinary);

  } catch(error) {
      core.setFailed(error)
  }
}

setupZarf();