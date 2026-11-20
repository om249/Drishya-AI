from alembic import op
import sqlalchemy as sa


revision = "20261120_10"
down_revision = "20261120_09"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "resume_job_matches",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=False),
        sa.Column("job_description_id", sa.Integer(), nullable=False),
        sa.Column("report_json", sa.JSON(), nullable=False),
        sa.Column(
            "matched_at",
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
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["job_description_id"],
            ["job_descriptions.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "resume_id",
            "job_description_id",
            name="uq_resume_job_match_pair",
        ),
    )

    op.create_index(
        "ix_resume_job_matches_user_id",
        "resume_job_matches",
        ["user_id"],
    )
    op.create_index(
        "ix_resume_job_matches_resume_id",
        "resume_job_matches",
        ["resume_id"],
    )
    op.create_index(
        "ix_resume_job_matches_job_description_id",
        "resume_job_matches",
        ["job_description_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_resume_job_matches_job_description_id",
        table_name="resume_job_matches",
    )
    op.drop_index(
        "ix_resume_job_matches_resume_id",
        table_name="resume_job_matches",
    )
    op.drop_index(
        "ix_resume_job_matches_user_id",
        table_name="resume_job_matches",
    )
    op.drop_table("resume_job_matches")