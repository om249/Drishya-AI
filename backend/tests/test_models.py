from app.models.user import User


def test_user_table_schema() -> None:
    columns = User.__table__.c
    assert User.__tablename__ == "users"
    assert columns.email.unique is True
    assert columns.email.index is True
    assert columns.password_hash.nullable is False
