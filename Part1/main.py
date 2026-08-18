import argparse
import logging
import os
from pathlib import Path

from app.audit import AuditLogger
from app.processor import SuperBossProcessor
from app.repositories.fake import FakeCandidateRepository
from app.repositories.webtutor import WebTutorRepository


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Add '— Супер Босс' to positions of selected WebTutor candidates."
    )
    parser.add_argument(
        "--mode",
        choices=("fake", "webtutor"),
        default=os.getenv("APP_MODE", "fake"),
        help="Repository mode. Default: fake.",
    )
    parser.add_argument(
        "--user",
        default=os.getenv("APP_USER", "test-user"),
        help="User/service identity written to the audit log.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Calculate and log changes without saving them.",
    )
    parser.add_argument(
        "--audit-file",
        default=os.getenv("AUDIT_FILE", "logs/audit.jsonl"),
        help="Audit JSONL path.",
    )
    return parser.parse_args()


def build_repository(mode: str):
    if mode == "fake":
        return FakeCandidateRepository()

    base_url = os.getenv("WEBTUTOR_BASE_URL")
    username = os.getenv("WEBTUTOR_USERNAME")
    password = os.getenv("WEBTUTOR_PASSWORD")

    missing = [
        name
        for name, value in (
            ("WEBTUTOR_BASE_URL", base_url),
            ("WEBTUTOR_USERNAME", username),
            ("WEBTUTOR_PASSWORD", password),
        )
        if not value
    ]

    if missing:
        raise RuntimeError(
            "Missing environment variables: " + ", ".join(missing)
        )

    return WebTutorRepository(base_url, username, password)


def main() -> int:
    args = parse_args()

    Path("logs").mkdir(exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    repository = build_repository(args.mode)
    audit = AuditLogger(args.audit_file)

    processor = SuperBossProcessor(
        repository=repository,
        audit_logger=audit,
        user=args.user,
        dry_run=args.dry_run,
    )

    stats = processor.run()

    print(
        f"found={stats.found} "
        f"updated={stats.updated} "
        f"skipped={stats.skipped} "
        f"failed={stats.failed}"
    )

    if args.mode == "fake":
        print("\nCandidates after processing:")
        for candidate in repository.candidates:
            print(
                f"{candidate.id}: {candidate.position_name!r}; "
                f"super_boss={candidate.super_boss}"
            )

    return 1 if stats.failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
