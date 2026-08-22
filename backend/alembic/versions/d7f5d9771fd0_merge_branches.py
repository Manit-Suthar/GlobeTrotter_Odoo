"""merge branches

Revision ID: d7f5d9771fd0
Revises: 001_initial_schema, 19488a41c4ce
Create Date: 2026-08-22 12:44:34.611468

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7f5d9771fd0'
down_revision: Union[str, Sequence[str], None] = ('001_initial_schema', '19488a41c4ce')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
