#!/usr/bin/env python3
"""Audit skill ownership, installed content, and Claude links without mutation."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


HEALTHY = "healthy"
WARNING_ISSUES = {"not-installed"}
FAILURE_ISSUES = {
    "missing-install",
    "content-drift",
    "missing-claude-link",
    "loose-claude",
    "dangling",
    "wrong-claude-link",
    "loose",
    "claude-only",
}
ISSUE_LABELS = {
    "missing-install": "MISSING INSTALL",
    "content-drift": "CONTENT DRIFT",
    "missing-claude-link": "MISSING CLAUDE LINK",
    "loose-claude": "LOOSE CLAUDE ENTRY",
    "dangling": "DANGLING CLAUDE LINK",
    "wrong-claude-link": "WRONG CLAUDE LINK",
    "loose": "LOOSE",
    "claude-only": "CLAUDE ONLY",
    "not-installed": "NOT INSTALLED",
}


def main() -> int:
    args = parse_args()
    paths = resolve_paths(args)
    report = audit(paths)

    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print_text_report(report)

    return 1 if report["summary"]["failures"] else 0


def parse_args() -> argparse.Namespace:
    home = Path.home()
    parser = argparse.ArgumentParser(
        description="Read-only audit of agent skill installation integrity."
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=home / "ai" / "agent-skills",
        help="Personal skill repository (default: ~/ai/agent-skills)",
    )
    parser.add_argument(
        "--agents-dir",
        type=Path,
        default=home / ".agents" / "skills",
        help="Installed skills directory (default: ~/.agents/skills)",
    )
    parser.add_argument(
        "--claude-dir",
        type=Path,
        default=home / ".claude" / "skills",
        help="Claude skill directory (default: ~/.claude/skills)",
    )
    parser.add_argument(
        "--lock-file",
        type=Path,
        default=home / ".agents" / ".skill-lock.json",
        help="External source metadata (default: ~/.agents/.skill-lock.json)",
    )
    parser.add_argument("--json", action="store_true", help="Emit deterministic JSON")
    return parser.parse_args()


def resolve_paths(args: argparse.Namespace) -> dict[str, Path]:
    paths = {
        "repo_skills": args.repo_root.expanduser().resolve() / "skills",
        "agents": args.agents_dir.expanduser().resolve(),
        "claude": args.claude_dir.expanduser().resolve(),
        "lock": args.lock_file.expanduser().resolve(),
    }
    if not paths["repo_skills"].is_dir():
        raise ValueError(
            f"Personal skill directory does not exist: {paths['repo_skills']}"
        )
    return paths


def audit(paths: dict[str, Path]) -> dict[str, Any]:
    personal_skills = discover_skills(paths["repo_skills"], require_manifest=True)
    installed_skills = discover_skills(paths["agents"], require_manifest=False)
    external_sources = load_external_sources(paths["lock"])

    records = []
    for name in sorted(personal_skills):
        records.append(
            audit_personal_skill(
                name=name,
                source=personal_skills[name],
                installed=installed_skills.get(name),
                claude_entry=paths["claude"] / name,
            )
        )

    external_names = external_sources.keys() - personal_skills.keys()
    for name in sorted(external_names):
        records.append(
            audit_external_skill(
                name=name,
                source=external_sources[name],
                installed=installed_skills.get(name),
                claude_entry=paths["claude"] / name,
                expected_install=paths["agents"] / name,
            )
        )

    unknown_installs = (
        installed_skills.keys() - personal_skills.keys() - external_sources.keys()
    )
    for name in sorted(unknown_installs):
        records.append(
            audit_loose_skill(
                name=name,
                installed=installed_skills[name],
                claude_entry=paths["claude"] / name,
            )
        )

    known_names = personal_skills.keys() | external_sources.keys() | installed_skills.keys()
    records.extend(
        audit_claude_only(
            claude_dir=paths["claude"],
            known_names=known_names,
        )
    )
    records.sort(key=record_sort_key)

    severity_counts = Counter(record["severity"] for record in records)
    issue_counts = Counter(issue for record in records for issue in record["issues"])
    return {
        "paths": {name: str(path) for name, path in sorted(paths.items())},
        "summary": {
            "healthy": severity_counts["healthy"],
            "warnings": severity_counts["warning"],
            "failures": severity_counts["failure"],
        },
        "issue_counts": dict(sorted(issue_counts.items())),
        "skills": records,
    }


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


def load_external_sources(lock_file: Path) -> dict[str, dict[str, str]]:
    if not lock_file.is_file():
        return {}

    lock_data = json.loads(lock_file.read_text(encoding="utf-8"))
    if not isinstance(lock_data, dict) or not isinstance(lock_data.get("skills"), dict):
        raise ValueError(f"Invalid skill lock structure: {lock_file}")

    sources = {}
    for name, metadata in lock_data["skills"].items():
        if not isinstance(name, str) or not isinstance(metadata, dict):
            raise ValueError(f"Invalid skill record in lock: {lock_file}")
        source = metadata.get("source")
        if not isinstance(source, str) or not source.strip():
            raise ValueError(f"Skill '{name}' has no source in lock: {lock_file}")
        sources[name] = {
            "source": source,
            "source_url": string_or_empty(metadata.get("sourceUrl")),
            "skill_path": string_or_empty(metadata.get("skillPath")),
        }
    return sources


def audit_personal_skill(
    name: str,
    source: Path,
    installed: Path | None,
    claude_entry: Path,
) -> dict[str, Any]:
    issues = []
    content_status = "matches"
    if installed is None:
        content_status = "missing"
        issues.append("missing-install")
    elif tree_fingerprint(source) != tree_fingerprint(installed):
        content_status = "drift"
        issues.append("content-drift")

    link_state = claude_path_state(claude_entry, installed)
    append_link_issue(issues, link_state)
    return make_record(
        name=name,
        source_group="Personal repository",
        ownership="personal",
        installed=installed,
        content_status=content_status,
        link_state=link_state,
        issues=issues,
        source_path=str(source),
    )


def audit_external_skill(
    name: str,
    source: dict[str, str],
    installed: Path | None,
    claude_entry: Path,
    expected_install: Path,
) -> dict[str, Any]:
    issues = []
    if installed is None:
        issues.append("not-installed")

    if (
        installed is None
        and not claude_entry.exists()
        and not claude_entry.is_symlink()
    ):
        link_state = {
            "path": str(claude_entry),
            "status": "not-applicable",
            "target": None,
        }
    else:
        link_state = claude_path_state(
            claude_entry,
            installed if installed is not None else expected_install,
        )
        append_link_issue(issues, link_state)

    return make_record(
        name=name,
        source_group=source["source"],
        ownership="external",
        installed=installed,
        content_status="not-compared",
        link_state=link_state,
        issues=issues,
        source_path=source["source_url"] or source["skill_path"] or None,
    )


def audit_loose_skill(
    name: str,
    installed: Path,
    claude_entry: Path,
) -> dict[str, Any]:
    issues = ["loose"]
    link_state = claude_path_state(claude_entry, installed)
    append_link_issue(issues, link_state)
    return make_record(
        name=name,
        source_group="Unknown source",
        ownership="unknown",
        installed=installed,
        content_status="unknown",
        link_state=link_state,
        issues=issues,
        source_path=None,
    )


def audit_claude_only(
    claude_dir: Path,
    known_names: set[str],
) -> list[dict[str, Any]]:
    if not claude_dir.is_dir():
        return []

    records = []
    for entry in sorted(claude_dir.iterdir(), key=lambda path: path.name):
        if entry.name in known_names:
            continue
        issues = ["claude-only"]
        link_state = claude_path_state(entry, None)
        append_link_issue(issues, link_state)
        records.append(
            make_record(
                name=entry.name,
                source_group="Claude only",
                ownership="claude-only",
                installed=None,
                content_status="not-applicable",
                link_state=link_state,
                issues=issues,
                source_path=None,
            )
        )
    return records


def make_record(
    name: str,
    source_group: str,
    ownership: str,
    installed: Path | None,
    content_status: str,
    link_state: dict[str, Any],
    issues: list[str],
    source_path: str | None,
) -> dict[str, Any]:
    severity = severity_for(issues)
    return {
        "name": name,
        "source_group": source_group,
        "ownership": ownership,
        "installed": installed is not None,
        "installed_path": str(installed) if installed is not None else None,
        "content_status": content_status,
        "claude_path": link_state,
        "issues": issues,
        "severity": severity,
        "status": status_text(severity, issues),
        "source_path": source_path,
    }


def severity_for(issues: list[str]) -> str:
    if any(issue in FAILURE_ISSUES for issue in issues):
        return "failure"
    if any(issue in WARNING_ISSUES for issue in issues):
        return "warning"
    return "healthy"


def status_text(severity: str, issues: list[str]) -> str:
    if severity == "healthy":
        return "HEALTHY"
    labels = ", ".join(ISSUE_LABELS[issue] for issue in issues)
    return f"{severity.upper()}: {labels}"


def append_link_issue(issues: list[str], link_state: dict[str, Any]) -> None:
    if link_state["status"] != HEALTHY:
        issues.append(link_state["status"])


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

    state["target"] = os.readlink(entry)
    try:
        resolved_target = entry.resolve(strict=True)
    except FileNotFoundError:
        state["status"] = "dangling"
        return state

    state["resolved_target"] = str(resolved_target)
    if expected_target is None or resolved_target != expected_target.resolve():
        state["status"] = "wrong-claude-link"
    return state


def record_sort_key(record: dict[str, Any]) -> tuple[int, str, str]:
    source_group = record["source_group"]
    if source_group == "Personal repository":
        group_order = 0
    elif source_group == "Unknown source":
        group_order = 2
    elif source_group == "Claude only":
        group_order = 3
    else:
        group_order = 1
    return group_order, source_group.casefold(), record["name"].casefold()


def string_or_empty(value: Any) -> str:
    return value if isinstance(value, str) else ""


def print_text_report(report: dict[str, Any]) -> None:
    print("Skill installation audit")
    print()
    print("Summary")
    print("| Status | Count |")
    print("|---|---:|")
    print(f"| Healthy | {report['summary']['healthy']} |")
    print(f"| Warnings | {report['summary']['warnings']} |")
    print(f"| Failures | {report['summary']['failures']} |")

    grouped_records = defaultdict(list)
    for record in report["skills"]:
        grouped_records[record["source_group"]].append(record)

    for source_group, records in grouped_records.items():
        print()
        print(source_group)
        print("| Skill | Installed | Claude link | Content | Status |")
        print("|---|---|---|---|---|")
        for record in records:
            installed = "Yes" if record["installed"] else "No"
            print(
                f"| {record['name']} | {installed} | "
                f"{record['claude_path']['status']} | "
                f"{record['content_status']} | {record['status']} |"
            )

    failures = [record for record in report["skills"] if record["severity"] == "failure"]
    if failures:
        print()
        print("Next actions")
        for record in failures:
            print(f"- {record['name']}: {next_action(record)}")

    print()
    result = "FAIL" if report["summary"]["failures"] else "PASS"
    print(f"Result: {result}")


def next_action(record: dict[str, Any]) -> str:
    actions = []
    issues = set(record["issues"])
    if "claude-only" in issues:
        return "remove the Claude-only entry or install and record its source"
    if "missing-install" in issues:
        actions.append("install the personal repository copy")
    if "content-drift" in issues:
        actions.append("reinstall from the personal repository")
    if "loose" in issues:
        actions.append("record its external source or remove the installed skill")
    if issues & {
        "missing-claude-link",
        "loose-claude",
        "dangling",
        "wrong-claude-link",
    }:
        if record["installed"]:
            actions.append("replace the Claude entry with a symlink to the installed skill")
        else:
            actions.append("remove the Claude entry or install the skill before linking it")
    return "; ".join(actions)


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError) as error:
        print(f"Audit failed: {error}", file=sys.stderr)
        sys.exit(2)
