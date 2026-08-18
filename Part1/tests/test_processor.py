import json
import tempfile
import unittest
from pathlib import Path

from app.audit import AuditLogger
from app.models import Candidate
from app.processor import SUFFIX, SuperBossProcessor
from app.repositories.fake import FakeCandidateRepository


class FailingRepository(FakeCandidateRepository):
    def update_position(self, candidate_id: int, position_name: str) -> None:
        if candidate_id == 10:
            raise RuntimeError("test integration error")
        super().update_position(candidate_id, position_name)


class SuperBossProcessorTests(unittest.TestCase):
    def make_audit(self, directory: str):
        return AuditLogger(Path(directory) / "audit.jsonl")

    def test_updates_only_super_boss_candidates(self):
        candidates = [
            Candidate(1, "Менеджер", True),
            Candidate(2, "Разработчик", False),
        ]

        with tempfile.TemporaryDirectory() as tmp:
            repo = FakeCandidateRepository(candidates)
            processor = SuperBossProcessor(repo, self.make_audit(tmp), "tester")
            stats = processor.run()

            self.assertEqual("Менеджер" + SUFFIX, repo.candidates[0].position_name)
            self.assertEqual("Разработчик", repo.candidates[1].position_name)
            self.assertEqual(1, stats.found)
            self.assertEqual(1, stats.updated)

    def test_is_idempotent(self):
        candidates = [Candidate(1, "Менеджер" + SUFFIX, True)]

        with tempfile.TemporaryDirectory() as tmp:
            repo = FakeCandidateRepository(candidates)
            processor = SuperBossProcessor(repo, self.make_audit(tmp), "tester")
            stats = processor.run()

            self.assertEqual("Менеджер" + SUFFIX, repo.candidates[0].position_name)
            self.assertEqual(0, stats.updated)
            self.assertEqual(1, stats.skipped)

    def test_empty_position_is_skipped(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = FakeCandidateRepository([Candidate(1, "   ", True)])
            processor = SuperBossProcessor(repo, self.make_audit(tmp), "tester")
            stats = processor.run()

            self.assertEqual(0, stats.updated)
            self.assertEqual(1, stats.skipped)

    def test_failure_is_audited_and_next_candidate_is_processed(self):
        candidates = [
            Candidate(10, "Директор", True),
            Candidate(11, "Менеджер", True),
        ]

        with tempfile.TemporaryDirectory() as tmp:
            audit_path = Path(tmp) / "audit.jsonl"
            repo = FailingRepository(candidates)
            processor = SuperBossProcessor(repo, AuditLogger(audit_path), "tester")
            stats = processor.run()

            self.assertEqual(1, stats.failed)
            self.assertEqual(1, stats.updated)
            self.assertEqual("Менеджер" + SUFFIX, repo.candidates[1].position_name)

            records = [
                json.loads(line)
                for line in audit_path.read_text(encoding="utf-8").splitlines()
            ]
            events = [record["event"] for record in records]
            self.assertIn("candidate_update_failed", events)
            self.assertIn("candidate_updated", events)

    def test_dry_run_does_not_modify_repository(self):
        candidates = [Candidate(1, "Менеджер", True)]

        with tempfile.TemporaryDirectory() as tmp:
            repo = FakeCandidateRepository(candidates)
            processor = SuperBossProcessor(
                repo,
                self.make_audit(tmp),
                "tester",
                dry_run=True,
            )
            stats = processor.run()

            self.assertEqual("Менеджер", repo.candidates[0].position_name)
            self.assertEqual(1, stats.updated)


if __name__ == "__main__":
    unittest.main()
