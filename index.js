const core = require('@actions/core');

const setupZarf = require('./lib/setup-zarf');

(async () => {
  try {
    await setupZarf();
  } catch(error) {
    core.setFailed(error.message);
  }
})();