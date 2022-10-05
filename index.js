const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { getZarfBinary } = require('./lib/utils');

async function setup() {
  try {
    // Get version of tool to be installed
    const version = core.getInput('version');

    // Download the specific version of the tool, e.g. as a tarball
    const download = getZarfBinary(version);
    const pathToBinary = await tc.downloadTool(download.url);

    // Expose the tool by adding it to the PATH
    core.addPath(pathToBinary);
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = setup