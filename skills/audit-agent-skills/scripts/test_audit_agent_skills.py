#!/usr/bin/env python3
"""Focused tests for audit_agent_skills.py."""

from __future__ import annotations

import importlib.util
import io
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("audit_agent_skills.py")
SPEC = importlib.util.spec_from_file_location("audit_agent_skills", MODULE_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Cannot load audit module: {MODULE_PATH}")
AUDIT_MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(AUDIT_MODULE)


class AuditAgentSkillsTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary_directory.name)
        self.repo_skills = self.root / "repo" / "skills"
        self.agents = self.root / "agents"
        self.claude = self.root / "claude"
        self.repo_skills.mkdir(parents=True)
        self.agents.mkdir()
        self.claude.mkdir()

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def test_classifies_repo_parity_and_claude_links(self) -> None:
        self.create_repo_and_install("healthy", "same")
        (self.claude / "healthy").symlink_to(self.agents / "healthy")

        self.create_repo_skill("missing", "source")
        self.create_repo_and_install("divergent", "source", "installed")
        self.create_repo_and_install("loose", "same")
        (self.claude / "loose").mkdir()
        self.create_repo_and_install("dangling", "same")
        (self.claude / "dangling").symlink_to(self.root / "absent")
        self.create_repo_and_install("unknown", "same")
        elsewhere = self.root / "elsewhere"
        elsewhere.mkdir()
        (self.claude / "unknown").symlink_to(elsewhere)

        report = AUDIT_MODULE.audit(self.paths())
        statuses = {
            record["name"]: record["status"]
            for record in report["skills"]
            if record["ownership"] == "repo"
        }

        self.assertEqual(
            statuses,
            {
                "dangling": "dangling",
                "divergent": "divergent",
                "healthy": "healthy",
                "loose": "loose-claude",
                "missing": "missing-install",
                "unknown": "unknown-source",
            },
        )

    def test_reports_simultaneous_content_and_link_failures(self) -> None:
        self.create_repo_and_install("combined", "source", "installed")
        (self.claude / "combined").mkdir()

        report = AUDIT_MODULE.audit(self.paths())
        record = next(
            record for record in report["skills"] if record["name"] == "combined"
        )

        self.assertEqual(record["content_status"], "divergent")
        self.assertEqual(record["claude_path"]["status"], "loose-claude")
        self.assertEqual(record["issues"], ["divergent", "loose-claude"])
        self.assertEqual(report["counts"]["divergent"], 1)
        self.assertEqual(report["counts"]["loose-claude"], 1)
        self.assertTrue(AUDIT_MODULE.has_integrity_failures(report))

    def test_classifies_external_and_claude_only_entries(self) -> None:
        (self.agents / "third-party").mkdir()
        external_loose = self.agents / "external-loose"
        external_loose.mkdir()
        (self.claude / "external-loose").mkdir()
        (self.claude / "orphan").symlink_to(self.root / "absent")
        loose = self.claude / "manual"
        loose.mkdir()

        report = AUDIT_MODULE.audit(self.paths())
        statuses = {
            (record["ownership"], record["name"]): record["status"]
            for record in report["skills"]
        }

        self.assertEqual(statuses[("external", "third-party")], "installed-only")
        external_record = next(
            record
            for record in report["skills"]
            if record["name"] == "external-loose"
        )
        self.assertEqual(
            external_record["issues"], ["installed-only", "loose-claude"]
        )
        output = io.StringIO()
        with redirect_stdout(output):
            AUDIT_MODULE.print_text_report(report)
        self.assertIn(
            "external     external-loose: content=not-compared "
            "claude=loose-claude issues=installed-only,loose-claude",
            output.getvalue(),
        )
        self.assertEqual(statuses[("claude-only", "orphan")], "dangling")
        self.assertEqual(statuses[("claude-only", "manual")], "loose-claude")
        self.assertTrue(AUDIT_MODULE.has_integrity_failures(report))

    def test_installed_only_without_topology_fault_is_informational(self) -> None:
        external = self.agents / "third-party"
        external.mkdir()
        (self.claude / "third-party").symlink_to(external)

        report = AUDIT_MODULE.audit(self.paths())

        self.assertFalse(AUDIT_MODULE.has_integrity_failures(report))
        self.assertFalse(report["provenance"]["verified"])
        self.assertIn("cannot prove installation history", report["provenance"]["limitation"])

    def test_audit_does_not_modify_the_audited_trees(self) -> None:
        self.create_repo_and_install("healthy", "same")
        (self.claude / "healthy").symlink_to(self.agents / "healthy")
        before = AUDIT_MODULE.tree_fingerprint(self.root)

        AUDIT_MODULE.audit(self.paths())

        self.assertEqual(AUDIT_MODULE.tree_fingerprint(self.root), before)

    def test_tree_fingerprint_detects_nested_content_changes(self) -> None:
        first = self.root / "first"
        second = self.root / "second"
        (first / "scripts").mkdir(parents=True)
        (second / "scripts").mkdir(parents=True)
        (first / "scripts" / "audit.py").write_text("one\n", encoding="utf-8")
        (second / "scripts" / "audit.py").write_text("two\n", encoding="utf-8")

        self.assertNotEqual(
            AUDIT_MODULE.tree_fingerprint(first),
            AUDIT_MODULE.tree_fingerprint(second),
        )

    def paths(self) -> dict[str, Path]:
        return {
            "repo_skills": self.repo_skills,
            "agents": self.agents,
            "claude": self.claude,
        }

    def create_repo_skill(self, name: str, content: str) -> None:
        skill = self.repo_skills / name
        skill.mkdir()
        (skill / "SKILL.md").write_text(content, encoding="utf-8")

    def create_repo_and_install(
        self, name: str, source_content: str, installed_content: str | None = None
    ) -> None:
        self.create_repo_skill(name, source_content)
        installed = self.agents / name
        installed.mkdir()
        (installed / "SKILL.md").write_text(
            installed_content or source_content, encoding="utf-8"
        )


if __name__ == "__main__":
    unittest.main()
