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

    const destination = path.join(os.homedir(), ".zarf/bin");
    core.info(`Install destination is ${destination}`);

    // Download the specified version of zarf
    const download = getZarf(version);
    const pathToBinary = await tc.downloadTool(download.url, destination);
    core.debug(`Successfully downloaded ${download.url}`);

    // Rename binary to just "zarf"
    const executable = await io.mv(pathToBinary, destination + "/zarf");
    core.debug(`Path to executable is ${executable}`);

    // Set executable permission for the zarf binary
    fs.chmod(executable, 100, (error) => {

      if (error) {
        core.setFailed("Failed to add executable permission to zarf binary...")
      } else {
        core.info("Successfully added executable permission to zarf binary...");
      }
  
    });

    // Expose the zarf binary by adding it to the PATH
    core.addPath(executable);

    // Execute the zarf binary
    await exec.exec(executable);

  } catch(error) {
      core.setFailed(error)
  }
}

setupZarf();