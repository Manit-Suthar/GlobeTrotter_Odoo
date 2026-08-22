"""add hotel_id to trip_stops

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-08-22 17:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('trip_stops', sa.Column('hotel_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index(op.f('ix_trip_stops_hotel_id'), 'trip_stops', ['hotel_id'], unique=False)
    op.create_foreign_key(
        'fk_trip_stops_hotel_id', 'trip_stops', 'hotels', ['hotel_id'], ['id'], ondelete='SET NULL'
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_trip_stops_hotel_id', 'trip_stops', type_='foreignkey')
    op.drop_index(op.f('ix_trip_stops_hotel_id'), table_name='trip_stops')
    op.drop_column('trip_stops', 'hotel_id')
