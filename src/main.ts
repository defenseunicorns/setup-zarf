import { runnerPlatform, setupZarf } from "./setup-zarf";

async function execute() {
    await setupZarf(runnerPlatform);
}

execute();