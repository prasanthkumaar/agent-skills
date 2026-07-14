#!/usr/bin/env python3
"""Audit repo-owned skill installs and Claude links without changing them."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from collections import Counter
from pathlib import Path
from typing import Any


HEALTHY = "healthy"
INTEGRITY_FAILURES = {
    "missing-install",
    "divergent",
    "missing-claude-link",
    "loose-claude",
    "dangling",
    "unknown-source",
}


def main() -> int:
    args = parse_args()
    paths = resolve_paths(args)
    report = audit(paths)

    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print_text_report(report)

    return 1 if has_integrity_failures(report) else 0


def parse_args() -> argparse.Namespace:
    home = Path.home()
    parser = argparse.ArgumentParser(
        description="Read-only audit of repo-owned agent skills and Claude links."
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=home / "ai" / "agent-skills",
        help="Repository root containing skills/ (default: ~/ai/agent-skills)",
    )
    parser.add_argument(
        "--agents-dir",
        type=Path,
        default=home / ".agents" / "skills",
        help="Global managed skill directory (default: ~/.agents/skills)",
    )
    parser.add_argument(
        "--claude-dir",
        type=Path,
        default=home / ".claude" / "skills",
        help="Claude skill link directory (default: ~/.claude/skills)",
    )
    parser.add_argument("--json", action="store_true", help="Emit deterministic JSON")
    return parser.parse_args()


def resolve_paths(args: argparse.Namespace) -> dict[str, Path]:
    paths = {
        "repo_skills": args.repo_root.expanduser().resolve() / "skills",
        "agents": args.agents_dir.expanduser().resolve(),
        "claude": args.claude_dir.expanduser().resolve(),
    }
    if not paths["repo_skills"].is_dir():
        raise SystemExit(f"Repo skills directory does not exist: {paths['repo_skills']}")
    return paths


def audit(paths: dict[str, Path]) -> dict[str, Any]:
    repo_skills = discover_skills(paths["repo_skills"], require_manifest=True)
    installed_skills = discover_skills(paths["agents"], require_manifest=False)

    records = []
    for name in sorted(repo_skills):
        records.append(
            audit_repo_skill(
                name,
                repo_skills[name],
                installed_skills.get(name),
                paths["claude"] / name,
            )
        )

    for name in sorted(installed_skills.keys() - repo_skills.keys()):
        link_state = claude_path_state(paths["claude"] / name, installed_skills[name])
        issues = ["installed-only"]
        if link_state["status"] != HEALTHY:
            issues.append(link_state["status"])
        records.append(
            {
                "name": name,
                "ownership": "external",
                "status": issues[0],
                "issues": issues,
                "content_status": "not-compared",
                "source_path": None,
                "installed_path": str(installed_skills[name]),
                "claude_path": link_state,
            }
        )

    records.extend(audit_claude_only(paths["claude"], repo_skills, installed_skills))
    records.sort(key=lambda record: (record["name"], record["ownership"]))
    counts = Counter(issue for record in records for issue in record["issues"])

    return {
        "paths": {name: str(path) for name, path in sorted(paths.items())},
        "provenance": {
            "verified": False,
            "limitation": (
                "This audit compares current content and Claude link topology only; "
                "it cannot prove installation history or that skills.sh created an entry."
            ),
        },
        "counts": dict(sorted(counts.items())),
        "skills": records,
    }


def has_integrity_failures(report: dict[str, Any]) -> bool:
    return any(
        issue in INTEGRITY_FAILURES
        for record in report["skills"]
        for issue in record["issues"]
    )


def discover_skills(root: Path, require_manifest: bool) -> dict[str, Path]:
    if not root.is_dir():
        return {}

    skills = {}
    for entry in sorted(root.iterdir(), key=lambda path: path.name):
        if not entry.is_dir():
            continue
        if require_manifest and not (entry / "SKILL.md").is_file():
            continue
        skills[entry.name] = entry
    return skills


def audit_repo_skill(
    name: str, source: Path, installed: Path | None, claude_entry: Path
) -> dict[str, Any]:
    record: dict[str, Any] = {
        "name": name,
        "ownership": "repo",
        "status": HEALTHY,
        "issues": [],
        "content_status": HEALTHY,
        "source_path": str(source),
        "installed_path": str(installed) if installed else None,
        "claude_path": None,
    }

    if installed is None:
        record["content_status"] = "missing-install"
        record["claude_path"] = claude_path_state(claude_entry, None)
        record["issues"] = ["missing-install"]
        if record["claude_path"]["status"] != HEALTHY:
            record["issues"].append(record["claude_path"]["status"])
        record["status"] = record["issues"][0]
        return record

    if tree_fingerprint(source) != tree_fingerprint(installed):
        record["content_status"] = "divergent"
        record["issues"].append("divergent")

    link_state = claude_path_state(claude_entry, installed)
    record["claude_path"] = link_state
    if link_state["status"] != HEALTHY:
        record["issues"].append(link_state["status"])
    if record["issues"]:
        record["status"] = record["issues"][0]
    return record


def tree_fingerprint(root: Path) -> str:
    digest = hashlib.sha256()
    for current_root, directory_names, file_names in os.walk(root, followlinks=False):
        directory_names.sort()
        file_names.sort()
        current_path = Path(current_root)

        for name in directory_names + file_names:
            path = current_path / name
            relative_path = path.relative_to(root).as_posix()
            digest.update(relative_path.encode("utf-8"))
            digest.update(b"\0")

            if path.is_symlink():
                digest.update(b"link\0")
                digest.update(os.readlink(path).encode("utf-8"))
            elif path.is_file():
                digest.update(b"file\0")
                with path.open("rb") as handle:
                    for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                        digest.update(chunk)
            elif path.is_dir():
                digest.update(b"dir\0")
            else:
                digest.update(b"other\0")
            digest.update(b"\0")
    return digest.hexdigest()


def claude_path_state(entry: Path, expected_target: Path | None) -> dict[str, Any]:
    state: dict[str, Any] = {"path": str(entry), "status": HEALTHY, "target": None}
    if not entry.exists() and not entry.is_symlink():
        state["status"] = "missing-claude-link"
        return state
    if not entry.is_symlink():
        state["status"] = "loose-claude"
        return state

    raw_target = os.readlink(entry)
    state["target"] = raw_target
    try:
        resolved_target = entry.resolve(strict=True)
    except FileNotFoundError:
        state["status"] = "dangling"
        return state

    state["resolved_target"] = str(resolved_target)
    if expected_target is None or resolved_target != expected_target.resolve():
        state["status"] = "unknown-source"
    return state


def audit_claude_only(
    claude_dir: Path,
    repo_skills: dict[str, Path],
    installed_skills: dict[str, Path],
) -> list[dict[str, Any]]:
    if not claude_dir.is_dir():
        return []

    known_names = repo_skills.keys() | installed_skills.keys()
    records = []
    for entry in sorted(claude_dir.iterdir(), key=lambda path: path.name):
        if entry.name in known_names:
            continue
        link_state = claude_path_state(entry, None)
        records.append(
            {
                "name": entry.name,
                "ownership": "claude-only",
                "status": link_state["status"],
                "issues": [link_state["status"]],
                "content_status": "not-compared",
                "source_path": None,
                "installed_path": None,
                "claude_path": link_state,
            }
        )
    return records


def print_text_report(report: dict[str, Any]) -> None:
    print("Agent skill audit")
    for name, path in report["paths"].items():
        print(f"{name}: {path}")
    print(f"provenance: not verified ({report['provenance']['limitation']})")
    print()

    for record in report["skills"]:
        issues = ",".join(record["issues"]) or HEALTHY
        claude_status = record["claude_path"]["status"]
        print(
            f"{record['ownership']:12} {record['name']}: "
            f"content={record['content_status']} claude={claude_status} issues={issues}"
        )

    print()
    counts = " ".join(
        f"{status}={count}" for status, count in report["counts"].items()
    )
    print(f"Counts: {counts or 'none'}")


if __name__ == "__main__":
    try:
        sys.exit(main())
    except OSError as error:
        print(f"Audit failed: {error}", file=sys.stderr)
        sys.exit(2)
