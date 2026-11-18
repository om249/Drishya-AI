"""add personalized interview session settings

Revision ID: 20261118_05
Revises: 20260816_04
"""

from alembic import op
import sqlalchemy as sa


revision = "20261118_05"
down_revision = "20260816_04"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "interviews",
        sa.Column(
            "experience_level",
            sa.String(length=30),
            nullable=False,
            server_default="fresher",
        ),
    )

    op.add_column(
        "interviews",
        sa.Column(
            "target_company",
            sa.String(length=120),
            nullable=True,
        ),
    )

    op.add_column(
        "interviews",
        sa.Column(
            "focus_areas",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "interviews",
        sa.Column(
            "question_count",
            sa.Integer(),
            nullable=False,
            server_default="5",
        ),
    )


def downgrade() -> None:
    op.drop_column("interviews", "question_count")
    op.drop_column("interviews", "focus_areas")
    op.drop_column("interviews", "target_company")
    op.drop_column("interviews", "experience_level")