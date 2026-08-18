from typing import Protocol

from app.models import Candidate


class CandidateRepository(Protocol):
    """Storage/integration contract for candidates.

    A real implementation can use REST, SOAP or another supported
    integration mechanism without changing the business logic.
    """

    def get_super_boss_candidates(self) -> list[Candidate]:
        ...

    def update_position(self, candidate_id: int, position_name: str) -> None:
        ...
