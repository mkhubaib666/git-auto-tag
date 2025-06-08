import * as fs from "fs";
import * as yaml from "js-yaml";
import * as core from "@actions/core";

export interface Config {
  major: string[];
  minor: string[];
  patch: string[];
  ignore: string[];
}

const defaultConfig: Config = {
  major: [],
  minor: [],
  patch: [],
  ignore: [],
};

/**
 * Loads and parses the .autotag.yml configuration file.
 */
export function loadConfig(path: string): Config {
  try {
    if (fs.existsSync(path)) {
      const fileContents = fs.readFileSync(path, "utf8");
      const loadedConfig = yaml.load(fileContents) as Partial<Config>;
      return { ...defaultConfig, ...loadedConfig };
    }
    core.info(
      `Configuration file not found at '${path}'. Using default behavior.`
    );
    return defaultConfig;
  } catch (error) {
    core.warning(`Error loading configuration: ${error}`);
    return defaultConfig;
  }
}