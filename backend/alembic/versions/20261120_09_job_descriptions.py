
"""create job descriptions

Revision ID: 20261120_09
Revises: 20261119_08
"""

from alembic import op
import sqlalchemy as sa


revision = "20261120_09"
down_revision = "20261119_08"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "job_descriptions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=150), nullable=False),
        sa.Column("company", sa.String(length=150), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
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
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["resume_id"],
            ["resume_profiles.id"],
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_job_descriptions_user_id",
        "job_descriptions",
        ["user_id"],
    )

    op.create_index(
        "ix_job_descriptions_resume_id",
        "job_descriptions",
        ["resume_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_job_descriptions_resume_id",
        table_name="job_descriptions",
    )
    op.drop_index(
        "ix_job_descriptions_user_id",
        table_name="job_descriptions",
    )
    op.drop_table("job_descriptions")
