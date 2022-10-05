const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { getZarfBinary } = require('./lib/utils');

async function setup() {
  try {
    core.debug('Inside try block');

    // Get version of tool to be installed
    const version = core.getInput('version');

    // Download the specific version of zarf
    const download = getZarfBinary(version);
    const pathToBinary = await tc.downloadTool(download.url);

    core.info(pathToBinary)
    core.info(download.url)

    // Expose the zarf binary by adding it to the PATH
    core.addPath(pathToBinary);
  } catch (err) {
    core.setFailed(err);
  }
}

module.exports = setup