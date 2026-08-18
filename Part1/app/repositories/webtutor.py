from app.models import Candidate


class WebTutorRepository:
    """Integration adapter placeholder for a real WebTutor installation.

    The exact transport depends on the target installation. The business
    layer intentionally does not know whether this adapter uses REST, SOAP,
    or another supported WebTutor integration interface.

    Do not invent endpoint URLs here. Replace the methods below after the
    target WebTutor API has been confirmed.
    """

    def __init__(self, base_url: str, username: str, password: str):
        self.base_url = base_url.rstrip("/")
        self.username = username
        self.password = password

    def get_super_boss_candidates(self) -> list[Candidate]:
        raise NotImplementedError(
            "Implement against the confirmed WebTutor integration interface"
        )

    def update_position(self, candidate_id: int, position_name: str) -> None:
        raise NotImplementedError(
            "Implement against the confirmed WebTutor integration interface"
        )
