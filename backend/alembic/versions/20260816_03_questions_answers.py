"""add questions and answers

Revision ID: 20260816_03
Revises: 20260815_02
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260816_03"
down_revision = "20260815_02"
branch_labels = depends_on = None

def upgrade() -> None:
    op.create_table("questions", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("interview_id", sa.Integer(), sa.ForeignKey("interviews.id", ondelete="CASCADE"), nullable=False), sa.Column("question_text", sa.Text(), nullable=False), sa.Column("question_type", sa.String(50), nullable=False), sa.Column("difficulty", sa.String(30), nullable=False), sa.Column("sequence_number", sa.Integer(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False), sa.UniqueConstraint("interview_id", "sequence_number"))
    op.create_index("ix_questions_interview_id", "questions", ["interview_id"])
    op.create_table("answers", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("question_id", sa.Integer(), sa.ForeignKey("questions.id", ondelete="CASCADE"), unique=True, nullable=False), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("answer_text", sa.Text(), nullable=False), sa.Column("score", sa.Integer(), nullable=False), sa.Column("technical_accuracy", sa.Integer(), nullable=False), sa.Column("relevance", sa.Integer(), nullable=False), sa.Column("completeness", sa.Integer(), nullable=False), sa.Column("clarity", sa.Integer(), nullable=False), sa.Column("strengths", postgresql.JSONB(), nullable=False), sa.Column("weaknesses", postgresql.JSONB(), nullable=False), sa.Column("missing_concepts", postgresql.JSONB(), nullable=False), sa.Column("improvement_suggestions", postgresql.JSONB(), nullable=False), sa.Column("feedback", sa.Text(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False))
    op.create_index("ix_answers_user_id", "answers", ["user_id"])

def downgrade() -> None:
    op.drop_table("answers"); op.drop_table("questions")
