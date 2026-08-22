"""add hotels table

Revision ID: a1b2c3d4e5f6
Revises: d7f5d9771fd0
Create Date: 2026-08-22 16:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'd7f5d9771fd0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'hotels',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('city_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('hotel_type', sa.String(length=50), nullable=True),
        sa.Column('price_per_night', sa.Float(), nullable=False),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('budget_category', sa.String(length=20), nullable=True),
        sa.Column('nearby_area', sa.String(length=100), nullable=True),
        sa.Column('popularity_score', sa.Integer(), nullable=True),
        sa.Column('tags', sa.String(length=255), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.ForeignKeyConstraint(['city_id'], ['cities.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_hotels_city_id'), 'hotels', ['city_id'], unique=False)
    op.create_index(op.f('ix_hotels_name'), 'hotels', ['name'], unique=False)
    op.create_index(op.f('ix_hotels_budget_category'), 'hotels', ['budget_category'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_hotels_budget_category'), table_name='hotels')
    op.drop_index(op.f('ix_hotels_name'), table_name='hotels')
    op.drop_index(op.f('ix_hotels_city_id'), table_name='hotels')
    op.drop_table('hotels')
