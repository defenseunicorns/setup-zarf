import core from '@actions/core';
import { setupZarf } from './lib/setup-zarf';

(async () => {
  try {
    await setupZarf();
  } catch(error) {
    let errorMessage = "Failed to install Zarf";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    core.setFailed(errorMessage);
  }
})();