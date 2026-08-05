#!/usr/bin/env python3
"""Focused tests for audit_agent_skills.py."""

from __future__ import annotations

import importlib.util
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path


MODULE_PATH = Path(__file__).with_name("audit_agent_skills.py")
SKILL_ROOT = MODULE_PATH.parent.parent
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
        self.agents = self.root / "agents" / "skills"
        self.claude = self.root / "claude"
        self.lock = self.root / "agents" / ".skill-lock.json"
        self.repo_skills.mkdir(parents=True)
        self.agents.mkdir(parents=True)
        self.claude.mkdir()
        self.write_lock({})

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def test_personal_repository_wins_and_checks_full_content_parity(self) -> None:
        self.create_repo_and_install("healthy", "same")
        (self.claude / "healthy").symlink_to(self.agents / "healthy")
        self.create_repo_and_install("drift", "source", "installed")
        (self.claude / "drift").symlink_to(self.agents / "drift")
        self.write_lock(
            {
                "healthy": self.external_metadata("external/ignored"),
                "drift": self.external_metadata("external/ignored"),
            }
        )

        report = AUDIT_MODULE.audit(self.paths())
        records = {record["name"]: record for record in report["skills"]}

        self.assertEqual(records["healthy"]["source_group"], "Personal repository")
        self.assertEqual(records["healthy"]["severity"], "healthy")
        self.assertEqual(records["drift"]["issues"], ["content-drift"])
        self.assertEqual(records["drift"]["severity"], "failure")

    def test_groups_known_external_skills_from_lock_without_content_comparison(self) -> None:
        self.create_installed_skill("research", "external content")
        (self.claude / "research").symlink_to(self.agents / "research")
        self.write_lock({"research": self.external_metadata("mattpocock/skills")})

        report = AUDIT_MODULE.audit(self.paths())
        record = report["skills"][0]

        self.assertEqual(record["source_group"], "mattpocock/skills")
        self.assertEqual(record["content_status"], "not-compared")
        self.assertEqual(record["severity"], "healthy")

    def test_unknown_installed_skill_is_loose_failure(self) -> None:
        self.create_installed_skill("mystery", "unknown")
        (self.claude / "mystery").symlink_to(self.agents / "mystery")

        report = AUDIT_MODULE.audit(self.paths())
        record = report["skills"][0]

        self.assertEqual(record["source_group"], "Unknown source")
        self.assertEqual(record["issues"], ["loose"])
        self.assertEqual(record["severity"], "failure")
        self.assertEqual(report["summary"]["failures"], 1)

    def test_lock_only_skill_is_not_installed_warning(self) -> None:
        self.write_lock({"domain-model": self.external_metadata("mattpocock/skills")})

        report = AUDIT_MODULE.audit(self.paths())
        record = report["skills"][0]

        self.assertEqual(record["issues"], ["not-installed"])
        self.assertEqual(record["severity"], "warning")
        self.assertEqual(record["claude_path"]["status"], "not-applicable")
        self.assertEqual(report["summary"]["warnings"], 1)
        self.assertEqual(report["summary"]["failures"], 0)

    def test_all_install_and_claude_defects_fail(self) -> None:
        self.create_repo_skill("missing", "source")
        self.create_repo_and_install("loose-link", "same")
        (self.claude / "loose-link").mkdir()
        self.create_repo_and_install("dangling", "same")
        (self.claude / "dangling").symlink_to(self.root / "absent")
        self.create_repo_and_install("wrong", "same")
        elsewhere = self.root / "elsewhere"
        elsewhere.mkdir()
        (self.claude / "wrong").symlink_to(elsewhere)
        self.create_repo_and_install("missing-link", "same")

        report = AUDIT_MODULE.audit(self.paths())
        records = {record["name"]: record for record in report["skills"]}

        self.assertEqual(
            records["missing"]["issues"],
            ["missing-install", "missing-claude-link"],
        )
        self.assertIn("loose-claude", records["loose-link"]["issues"])
        self.assertIn("dangling", records["dangling"]["issues"])
        self.assertIn("wrong-claude-link", records["wrong"]["issues"])
        self.assertIn("missing-claude-link", records["missing-link"]["issues"])
        self.assertEqual(report["summary"]["failures"], 5)

    def test_claude_only_entry_fails(self) -> None:
        target = self.root / "elsewhere"
        target.mkdir()
        (self.claude / "orphan").symlink_to(target)

        report = AUDIT_MODULE.audit(self.paths())
        record = report["skills"][0]

        self.assertEqual(record["source_group"], "Claude only")
        self.assertEqual(record["issues"], ["claude-only", "wrong-claude-link"])
        self.assertEqual(record["severity"], "failure")

    def test_report_groups_sources_and_lists_actions_for_failures_only(self) -> None:
        self.create_repo_and_install("personal", "same")
        (self.claude / "personal").symlink_to(self.agents / "personal")
        self.create_installed_skill("mystery", "unknown")
        (self.claude / "mystery").symlink_to(self.agents / "mystery")
        self.write_lock({"waiting": self.external_metadata("mattpocock/skills")})

        report = AUDIT_MODULE.audit(self.paths())
        output = io.StringIO()
        with redirect_stdout(output):
            AUDIT_MODULE.print_text_report(report)
        text = output.getvalue()

        self.assertIn("| Healthy | 1 |", text)
        self.assertIn("| Warnings | 1 |", text)
        self.assertIn("| Failures | 1 |", text)
        self.assertLess(text.index("Personal repository"), text.index("mattpocock/skills"))
        self.assertLess(text.index("mattpocock/skills"), text.index("Unknown source"))
        actions = text.split("Next actions", maxsplit=1)[1]
        self.assertIn("- mystery:", actions)
        self.assertNotIn("- waiting:", actions)

    def test_audit_does_not_modify_audited_trees(self) -> None:
        self.create_repo_and_install("healthy", "same")
        (self.claude / "healthy").symlink_to(self.agents / "healthy")
        before = AUDIT_MODULE.tree_fingerprint(self.root)

        AUDIT_MODULE.audit(self.paths())

        self.assertEqual(AUDIT_MODULE.tree_fingerprint(self.root), before)

    def test_content_parity_includes_nested_files(self) -> None:
        self.create_repo_and_install("nested", "same")
        source_script = self.repo_skills / "nested" / "scripts" / "audit.py"
        installed_script = self.agents / "nested" / "scripts" / "audit.py"
        source_script.parent.mkdir()
        installed_script.parent.mkdir()
        source_script.write_text("source\n", encoding="utf-8")
        installed_script.write_text("installed\n", encoding="utf-8")
        (self.claude / "nested").symlink_to(self.agents / "nested")

        report = AUDIT_MODULE.audit(self.paths())

        self.assertEqual(report["skills"][0]["issues"], ["content-drift"])

    def test_rejects_lock_records_without_source(self) -> None:
        self.write_lock({"broken": {"skillPath": "broken/SKILL.md"}})

        with self.assertRaisesRegex(ValueError, "has no source"):
            AUDIT_MODULE.audit(self.paths())

    def test_skill_is_explicit_only_for_claude_and_codex(self) -> None:
        skill_text = (SKILL_ROOT / "SKILL.md").read_text(encoding="utf-8")
        openai_text = (SKILL_ROOT / "agents" / "openai.yaml").read_text(
            encoding="utf-8"
        )

        self.assertIn("disable-model-invocation: true", skill_text)
        self.assertIn("Use only when explicitly asked", skill_text)
        self.assertIn("$audit-agent-skills", openai_text)
        self.assertIn("allow_implicit_invocation: false", openai_text)

    def paths(self) -> dict[str, Path]:
        return {
            "repo_skills": self.repo_skills,
            "agents": self.agents,
            "claude": self.claude,
            "lock": self.lock,
        }

    def write_lock(self, skills: dict[str, dict[str, str]]) -> None:
        self.lock.write_text(
            json.dumps({"version": 3, "skills": skills}),
            encoding="utf-8",
        )

    def create_repo_skill(self, name: str, content: str) -> None:
        skill = self.repo_skills / name
        skill.mkdir()
        (skill / "SKILL.md").write_text(content, encoding="utf-8")

    def create_installed_skill(self, name: str, content: str) -> None:
        installed = self.agents / name
        installed.mkdir()
        (installed / "SKILL.md").write_text(content, encoding="utf-8")

    def create_repo_and_install(
        self,
        name: str,
        source_content: str,
        installed_content: str | None = None,
    ) -> None:
        self.create_repo_skill(name, source_content)
        self.create_installed_skill(name, installed_content or source_content)

    def external_metadata(self, source: str) -> dict[str, str]:
        return {
            "source": source,
            "sourceUrl": f"https://github.com/{source}.git",
            "skillPath": "skills/example/SKILL.md",
        }


if __name__ == "__main__":
    unittest.main()
