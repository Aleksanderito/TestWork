from dataclasses import dataclass


@dataclass
class Candidate:
    """Domain model used by the business layer."""

    id: int
    position_name: str
    super_boss: bool
