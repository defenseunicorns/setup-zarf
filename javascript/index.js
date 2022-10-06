const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { getZarfBinary } = require('./lib/utils');

async function setup() {
  try {
    // Get version of zarf to be installed
    const version = core.getInput('version');

    // Download the specific version of zarf
    const download = getZarfBinary(version);
    const pathToBinary = await tc.downloadTool(download.url);

    core.warning(pathToBinary)

    // Expose the zarf binary by adding it to the PATH
    core.addPath(pathToBinary);
  } catch (err) {
    core.setFailed(err);
  }
}

module.exports = setup