import * as semver from "semver";
import * as micromatch from "micromatch";
import { Config } from "./config";

type BumpLevel = "major" | "minor" | "patch" | "none";
// Add the 'export' keyword here to make this type available to other files.
export type ValidBumpLevel = "major" | "minor" | "patch";

/**
 * Determines the bump level based on changed files and configuration.
 */
export function determineBumpLevel(
  files: string[],
  config: Config,
  defaultBump: string
): BumpLevel {
  let level: BumpLevel = "none";

  const nonIgnoredFiles = files.filter(
    (file) => !micromatch.isMatch(file, config.ignore)
  );

  if (nonIgnoredFiles.length === 0) {
    return "none";
  }

  for (const file of nonIgnoredFiles) {
    if (micromatch.isMatch(file, config.major)) {
      return "major"; // Highest priority
    }
    if (micromatch.isMatch(file, config.minor)) {
      level = "minor";
    }
    if (micromatch.isMatch(file, config.patch) && level === "none") {
      level = "patch";
    }
  }

  if (level === "none") {
    const validBumps: BumpLevel[] = ["major", "minor", "patch"];
    if (validBumps.includes(defaultBump as BumpLevel)) {
      return defaultBump as BumpLevel;
    }
  }

  return level;
}

/**
 * Calculates the new tag based on the latest tag and bump level.
 */
export function calculateNewTag(
  latestTag: string,
  level: ValidBumpLevel,
  prefix: string
): string {
  if (!latestTag) {
    return `${prefix}1.0.0`;
  }

  const version = latestTag.replace(prefix, "");
  const newVersion = semver.inc(version, level);

  if (!newVersion) {
    throw new Error(`Could not increment version '${version}' by '${level}'`);
  }

  return `${prefix}${newVersion}`;
}