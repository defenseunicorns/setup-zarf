const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec')
const io = require('@actions/io')
const { getZarfBinary } = require('./lib/utils');

async function setup() {
  try {
    // Get version of zarf to be installed
    const version = core.getInput('version');

    // Download the specific version of zarf
    const download = getZarfBinary(version);
    const pathToBinary = await tc.downloadTool(download.url);

    // Debugging. Need to remove when finished
    core.debug(pathToBinary);

    // Expose the zarf binary by adding it to the PATH
    core.addPath(pathToBinary);

    // Get the path to the zarf binary
    const zarfPath = await io.which('zarf', true);

    // Debugging. Need to remove when finished
    core.debug(zarfPath);

    // Execute the zarf binary
    await exec.exec(`"${zarfPath}"`);

  } catch (err) {
    core.setFailed(err);
  }
}

setup();