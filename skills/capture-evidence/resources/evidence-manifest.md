# Evidence Manifest Format

Store the manifest in the OS temp directory. It maps verification artefacts to the correct branch or PR.

Recommended path:

```text
$TMPDIR/pr-evidence-<repo-slug>-<stack-or-pr>.json
```

## JSON shape

```json
{
  "version": 1,
  "repo": "/absolute/repo/path",
  "stackId": "pr-123-or-stack-123-124",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601",
  "entries": [
    {
      "branch": "feature/name",
      "pr": 123,
      "headSha": "abc123",
      "commands": [
        {
          "command": "pnpm check-types",
          "exitCode": 0,
          "summary": "passed",
          "outputPath": "/tmp/path/check-types.txt"
        }
      ],
      "ci": [
        {
          "name": "Code Quality",
          "status": "passed",
          "url": "https://github.com/org/repo/actions/runs/..."
        }
      ],
      "screenshots": [
        {
          "label": "Storybook button states",
          "localPath": "/tmp/path/pr-123-storybook.png",
          "uploadedUrl": "",
          "notes": "Captured from branch feature/name at abc123"
        }
      ],
      "browserNotes": [
        "Opened Storybook story and verified dark mode toggle rendered correctly."
      ]
    }
  ]
}
```

`write-pr-description` may fill `uploadedUrl` after uploading images to GitHub.
