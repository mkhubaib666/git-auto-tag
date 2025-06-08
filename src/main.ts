import * as core from "@actions/core";
import { getChangedFiles, getLatestTag, createAndPushTag } from "./git";
import { loadConfig } from "./config";
import {
  determineBumpLevel,
  calculateNewTag,
  ValidBumpLevel, // This import will now succeed
} from "./version";

async function run(): Promise<void> {
  try {
    const token = core.getInput("github-token", { required: true });
    const configPath = core.getInput("config-path");
    const defaultBump = core.getInput("default-bump");
    const tagPrefix = core.getInput("tag-prefix");

    const latestTag = await getLatestTag();
    core.info(`Latest tag found: ${latestTag || "None"}`);
    core.setOutput("old-tag", latestTag);

    const changedFiles = await getChangedFiles(latestTag);
    if (changedFiles.length === 0) {
      core.info("No changed files found. Exiting.");
      core.setOutput("bump-level", "none");
      return;
    }
    core.info(`Changed files: \n${changedFiles.join("\n")}`);

    const config = loadConfig(configPath);
    const bumpLevel = determineBumpLevel(changedFiles, config, defaultBump);
    core.info(`Determined version bump level: ${bumpLevel}`);
    core.setOutput("bump-level", bumpLevel);

    if (bumpLevel === "none") {
      core.info("No version bump required. Exiting.");
      return;
    }

    const newTag = calculateNewTag(
      latestTag,
      bumpLevel as ValidBumpLevel,
      tagPrefix
    );
    core.info(`New tag to be created: ${newTag}`);
    core.setOutput("new-tag", newTag);

    await createAndPushTag(newTag, token);
    core.info(`Successfully created and pushed tag ${newTag}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unknown error occurred.");
    }
  }
}

run();