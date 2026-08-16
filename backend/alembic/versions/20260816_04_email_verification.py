"""add email verification

Revision ID: 20260816_04
Revises: 20260816_03
"""
from alembic import op
import sqlalchemy as sa

revision = "20260816_04"
down_revision = "20260816_03"
branch_labels = depends_on = None

def upgrade() -> None:
    op.create_table("email_verifications", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(100), nullable=False), sa.Column("email", sa.String(255), nullable=False, unique=True), sa.Column("password_hash", sa.String(255), nullable=False), sa.Column("otp_hash", sa.String(255), nullable=False), sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False), sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")))
    op.create_index("ix_email_verifications_email", "email_verifications", ["email"])

def downgrade() -> None:
    op.drop_table("email_verifications")
