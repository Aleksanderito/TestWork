from copy import deepcopy

from app.models import Candidate


DEFAULT_CANDIDATES = [
    Candidate(id=1, position_name="Менеджер по продажам", super_boss=True),
    Candidate(id=2, position_name="Разработчик", super_boss=False),
    Candidate(id=3, position_name="Директор", super_boss=True),
    Candidate(id=4, position_name="Аналитик — Супер Босс", super_boss=True),
    Candidate(id=5, position_name="", super_boss=True),
]


class FakeCandidateRepository:
    """In-memory repository for demonstration and unit tests."""

    def __init__(self, candidates: list[Candidate] | None = None):
        source = candidates if candidates is not None else DEFAULT_CANDIDATES
        self.candidates = deepcopy(source)

    def get_super_boss_candidates(self) -> list[Candidate]:
        return [candidate for candidate in self.candidates if candidate.super_boss]

    def update_position(self, candidate_id: int, position_name: str) -> None:
        for candidate in self.candidates:
            if candidate.id == candidate_id:
                candidate.position_name = position_name
                return

        raise KeyError(f"Candidate {candidate_id} was not found")
