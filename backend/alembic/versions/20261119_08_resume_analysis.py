
"""Add AI resume analysis fields."""

from alembic import op
import sqlalchemy as sa


revision = "20261119_08"
down_revision = "20261119_07"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "resume_profiles",
        sa.Column("analysis_json", sa.JSON(), nullable=True),
    )
    op.add_column(
        "resume_profiles",
        sa.Column(
            "analyzed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )


def downgrade():
    op.drop_column("resume_profiles", "analyzed_at")
    op.drop_column("resume_profiles", "analysis_json")
