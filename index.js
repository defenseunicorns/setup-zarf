const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');
const fs = require('fs');
const { getZarfBinary } = require('./lib/utils');

async function setupZarf() {
  try {
    // Get version of zarf to be installed
    const version = core.getInput('version');

    // Download the specified version of zarf
    const download = getZarfBinary(version);
    const pathToBinary = await tc.downloadTool(download.url);

    // Set executable permission for the zarf binary
    fs.chmod(pathToBinary, 100, (err) => {

      if (err) {
        core.setFailed("Failed to add executable permission to zarf binary...");
      } else {
        core.info("Successfully added executable permission to zarf binary...");
      }
  
    });

    // Verify we have executable permissions on the zarf binary
    fs.access(pathToBinary, fs.constants.X_OK, (err) => {

      if (err) {
      core.setFailed("Do not have executable permissions for the zarf binary...");
      } else {
      core.info("Can execute the zarf binary...");
      }

    });

    // Expose the zarf binary by adding it to the PATH
    core.addPath(pathToBinary);

    // Execute the zarf binary
    core.info("Executing the zarf binary...")
    await exec.exec(pathToBinary);

    // Set the path to the executable zarf binary as a job output
    core.setOutput("zarfPath", pathToBinary);

  } catch (err) {
    core.setFailed(err);
  }
}

setupZarf();