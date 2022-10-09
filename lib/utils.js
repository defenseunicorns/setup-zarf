const os = require('os');
const path = require('path');

// arch in [arm, x32, x64...] (https://nodejs.org/api/os.html#os_os_arch)
// return value in [amd64, 386, arm]
function mapArch(arch) {
  const mappings = {
    // os.arch() returns 'arm64' for ARM-based architectures, which is in the same format as the pre-packaged zarf binaries
    x64: 'amd64'
  };
  return mappings[arch] || arch;
}

// os in [darwin, linux] (https://nodejs.org/api/os.html#os_os_platform)
// return value in [Darwin, Linux]
function mapOS(os) {
  const mappings = {
    darwin: 'Darwin',
    linux: 'Linux'
  };
  return mappings[os] || os;
}

function getZarfBinary(version) {
  const platform = os.platform();
  const arch = os.arch();
  const filename = `zarf_v${ version }_${ mapOS(platform) }_${ mapArch(arch) }`;
  const url = `https://github.com/defenseunicorns/zarf/releases/download/v${ version }/${ filename }`;
  return {
    url,
    filename
  };
}

module.exports = { getZarfBinary }
