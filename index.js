const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const { getZarfBinary } = require('./lib/utils');

async function setup() {
  try {
    // Get version of tool to be installed
    const version = core.getInput('version');

    // Download the specific version of the tool, e.g. as a tarball
    const download = getZarfBinary(version);
    const pathToTarball = await tc.downloadTool(download.url);

    // Extract the tarball onto the runner
    const pathToCLI = await tc.extractTar(pathToTarball);

    // Expose the tool by adding it to the PATH
    core.addPath(path.join(pathToCLI,download.binPath));
  } catch (e) {
    core.setFailed(e);
  }
}

module.exports = setup