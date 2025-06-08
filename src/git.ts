import * as exec from "@actions/exec";
import * as github from "@actions/github";

/**
 * Gets the latest semantic version tag from the repository.
 */
export async function getLatestTag(): Promise<string> {
  let latestTag = "";
  const options: exec.ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        latestTag += data.toString();
      },
    },
    ignoreReturnCode: true, // Don't fail if no tags are found
  };
  await exec.exec("git", ["describe", "--tags", "--abbrev=0"], options);
  return latestTag.trim();
}

/**
 * Gets the list of changed files since a specific tag or from the beginning.
 */
export async function getChangedFiles(fromRef: string): Promise<string[]> {
  const args = fromRef
    ? ["diff", "--name-only", fromRef, "HEAD"]
    // If no tag, get all files in the repo
    : ["ls-tree", "-r", "HEAD", "--name-only"];

  let output = "";
  const options: exec.ExecOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString();
      },
    },
  };
  await exec.exec("git", args, options);
  return output.trim().split("\n");
}

/**
 * Creates and pushes a new Git tag.
 */
export async function createAndPushTag(
  tag: string,
  token: string
): Promise<void> {
  const octokit = github.getOctokit(token);
  const { owner, repo } = github.context.repo;

  const ref = await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/tags/${tag}`,
    sha: github.context.sha,
  });

  if (ref.status !== 201) {
    throw new Error(`Failed to create tag ref. Status: ${ref.status}`);
  }
}