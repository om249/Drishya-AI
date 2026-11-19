
"""create resume profiles

Revision ID: 20261119_06
Revises: 20261118_05
"""

from alembic import op
import sqlalchemy as sa


revision = "20261119_06"
down_revision = "20261118_05"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "resume_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("file_type", sa.String(length=10), nullable=False),
        sa.Column("extracted_text", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )

    op.create_index(
        "ix_resume_profiles_user_id",
        "resume_profiles",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_resume_profiles_user_id",
        table_name="resume_profiles",
    )
    op.drop_table("resume_profiles")
