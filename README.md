# Git-Auto-Tag



**Declarative, path-based semantic versioning for your Git repositories. Automate your versioning based on what code actually changed.**

[![CI](https://github.com/mkhubaib666/git-auto-tag/actions/workflows/ci.yml/badge.svg)](https://github.com/mkhubaib666/git-auto-tag/actions/workflows/ci.yml)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Git--Auto--Tag-blue.svg?colorA=24292e&colorB=0366d6&style=flat&longCache=true&logo=github)](https://github.com/marketplace/actions/git-auto-tag) <!-- Link this once published -->

---

### **The Problem**

How do you decide when to release a `major`, `minor`, or `patch` version?
-   **Manual Tagging:** Inconsistent, error-prone, and easily forgotten.
-   **Conventional Commits:** Forces strict discipline on commit messages and struggles with "squash and merge" workflows.

### **The Solution: Declarative Versioning**

**Git-Auto-Tag** automates versioning by looking at the changed file paths, not commit messages. You declare your versioning strategy in a simple YAML file, and the action does the rest.

Define a `.autotag.yml` file in your repository:

```yaml
# .autotag.yml
# The highest-level change determines the version bump.

major:
  # Changing the public API contract is a major change.
  - "src/api/v1/**"
  # Changing the core database schema is a major change.
  - "db/migrations/**"

minor:
  # Adding a new feature or component is a minor change.
  - "src/features/**"
  # Changing non-critical application routes.
  - "src/routes.ts"

patch:
  # Bug fixes, UI tweaks, and dependency updates are patches.
  - "src/components/**"
  - "package.json"
  - "go.mod"

# Files listed here will be ignored and never trigger a version bump.
ignore:
  - "docs/**"
  - "README.md"
  - "**.test.ts"
```

When you merge a PR, this action inspects the changed files, finds the highest-level change according to your rules, and automatically creates and pushes the correct new semantic version tag.

### **Usage**

Create a workflow file in your repository (e.g., `.github/workflows/release.yml`):

```yaml
name: Create Tagged Release

on:
  push:
    branches:
      - main

jobs:
  tag:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          # Fetch all history and tags to find the last version
          fetch-depth: 0

      - name: Git Auto Tag
        id: auto-tag
        uses: mkhubaib666/git-auto-tag@v1 # Use your repo name
        with:
          github-token: "${{ secrets.GITHUB_TOKEN }}"
          # Optional: Set a default bump level if no rules match
          default-bump: "patch"

      - name: Print new tag
        if: steps.auto-tag.outputs.new-tag
        run: echo "Created new tag: ${{ steps.auto-tag.outputs.new-tag }}"
```

### **Configuration**

#### **Inputs**

| Input            | Description                                                              | Default           |
| ---------------- | ------------------------------------------------------------------------ | ----------------- |
| `github-token`   | **Required.** The GitHub token to use for creating tags.                 |                   |
| `config-path`    | Path to the configuration file.                                          | `.autotag.yml`    |
| `default-bump`   | The default version bump if changed files don't match any rules.         | `patch`           |
| `tag-prefix`     | A prefix to add to the version number when creating a tag.               | `v`               |
| `create-release` | If `true`, creates a GitHub Release with the new tag. (Coming soon!)     | `false`           |

#### **Outputs**

| Output       | Description                                                        | Example   |
| ------------ | ------------------------------------------------------------------ | --------- |
| `new-tag`    | The newly created tag. Empty if no tag was created.                | `v1.2.0`  |
| `old-tag`    | The previous tag that the bump was based on.                       | `v1.1.5`  |
| `bump-level` | The level of the version bump (`major`, `minor`, `patch`, or `none`). | `minor`   |

---

### **Contributing**

Contributions are welcome! Please open an issue or submit a pull request.