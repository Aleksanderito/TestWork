import logging
from dataclasses import dataclass
from uuid import uuid4

from app.audit import AuditLogger
from app.models import Candidate
from app.repositories.base import CandidateRepository


logger = logging.getLogger(__name__)

SUFFIX = " — Супер Босс"


@dataclass
class ProcessingStats:
    found: int = 0
    updated: int = 0
    skipped: int = 0
    failed: int = 0


class SuperBossProcessor:
    """Business service that applies the Super Boss suffix rule."""

    def __init__(
        self,
        repository: CandidateRepository,
        audit_logger: AuditLogger,
        user: str,
        *,
        dry_run: bool = False,
    ):
        self.repository = repository
        self.audit = audit_logger
        self.user = user
        self.dry_run = dry_run

    def run(self) -> ProcessingStats:
        run_id = str(uuid4())
        candidates = self.repository.get_super_boss_candidates()
        stats = ProcessingStats(found=len(candidates))

        logger.info("Found %s candidates with super_boss=true", stats.found)
        self.audit.write(
            "job_started",
            run_id=run_id,
            user=self.user,
            found=stats.found,
            dry_run=self.dry_run,
        )

        for candidate in candidates:
            self._process_candidate(candidate, run_id, stats)

        self.audit.write(
            "job_finished",
            run_id=run_id,
            user=self.user,
            found=stats.found,
            updated=stats.updated,
            skipped=stats.skipped,
            failed=stats.failed,
            dry_run=self.dry_run,
        )

        logger.info(
            "Finished: found=%s updated=%s skipped=%s failed=%s",
            stats.found,
            stats.updated,
            stats.skipped,
            stats.failed,
        )

        return stats

    def _process_candidate(
        self,
        candidate: Candidate,
        run_id: str,
        stats: ProcessingStats,
    ) -> None:
        old_position = (candidate.position_name or "").strip()

        if not old_position:
            stats.skipped += 1
            logger.warning("Candidate %s has empty position", candidate.id)
            self.audit.write(
                "candidate_skipped",
                run_id=run_id,
                user=self.user,
                candidate_id=candidate.id,
                reason="empty_position",
            )
            return

        if old_position.endswith(SUFFIX):
            stats.skipped += 1
            logger.info("Candidate %s already contains suffix", candidate.id)
            self.audit.write(
                "candidate_skipped",
                run_id=run_id,
                user=self.user,
                candidate_id=candidate.id,
                reason="suffix_already_present",
                old_value=old_position,
            )
            return

        new_position = old_position + SUFFIX

        if self.dry_run:
            stats.updated += 1
            logger.info(
                "DRY RUN candidate %s: %r -> %r",
                candidate.id,
                old_position,
                new_position,
            )
            self.audit.write(
                "candidate_update_planned",
                run_id=run_id,
                user=self.user,
                candidate_id=candidate.id,
                old_value=old_position,
                new_value=new_position,
                status="dry_run",
            )
            return

        try:
            self.repository.update_position(candidate.id, new_position)
        except Exception as exc:  # boundary: integration/storage errors
            stats.failed += 1
            logger.exception("Failed to update candidate %s", candidate.id)
            self.audit.write(
                "candidate_update_failed",
                run_id=run_id,
                user=self.user,
                candidate_id=candidate.id,
                old_value=old_position,
                new_value=new_position,
                status="failed",
                error=str(exc),
            )
            return

        stats.updated += 1
        logger.info(
            "Candidate %s updated: %r -> %r",
            candidate.id,
            old_position,
            new_position,
        )
        self.audit.write(
            "candidate_updated",
            run_id=run_id,
            user=self.user,
            candidate_id=candidate.id,
            old_value=old_position,
            new_value=new_position,
            status="success",
        )
