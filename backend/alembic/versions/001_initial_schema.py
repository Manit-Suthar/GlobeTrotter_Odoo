"""Initial schema for GlobeTrotter database

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-22 10:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # 2. cities
    op.create_table(
        'cities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('country', sa.String(length=100), nullable=False, server_default='India'),
        sa.Column('latitude', sa.Float(), nullable=True),
        sa.Column('longitude', sa.Float(), nullable=True),
        sa.Column('cost_index', sa.Float(), nullable=True, server_default='1.0'),
        sa.Column('popularity', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('tourism_type', sa.String(length=255), nullable=True),
        sa.Column('best_season', sa.String(length=50), nullable=True),
    )
    op.create_index('ix_cities_name', 'cities', ['name'], unique=False)
    op.create_index('ix_cities_state', 'cities', ['state'], unique=False)
    op.create_index('ix_cities_country', 'cities', ['country'], unique=False)
    op.create_index('ix_cities_popularity', 'cities', ['popularity'], unique=False)

    # 3. activities
    op.create_table(
        'activities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('city_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cities.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=50), nullable=True),
        sa.Column('default_cost', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('default_duration_minutes', sa.Integer(), nullable=False, server_default='60'),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('tags', sa.String(length=255), nullable=True),
    )
    op.create_index('ix_activities_city_id', 'activities', ['city_id'], unique=False)
    op.create_index('ix_activities_name', 'activities', ['name'], unique=False)
    op.create_index('ix_activities_category', 'activities', ['category'], unique=False)

    # 4. trips
    op.create_table(
        'trips',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('cover_photo', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('ix_trips_user_id', 'trips', ['user_id'], unique=False)

    # 5. trip_stops
    op.create_table(
        'trip_stops',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('trip_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False),
        sa.Column('city_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('cities.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_trip_stops_trip_id', 'trip_stops', ['trip_id'], unique=False)
    op.create_index('ix_trip_stops_city_id', 'trip_stops', ['city_id'], unique=False)
    op.create_index('idx_trip_stops_trip_order', 'trip_stops', ['trip_id', 'order_index'], unique=False)

    # 6. trip_activities
    op.create_table(
        'trip_activities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('trip_stop_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('trip_stops.id', ondelete='CASCADE'), nullable=False),
        sa.Column('activity_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('activities.id', ondelete='SET NULL'), nullable=True),
        sa.Column('custom_name', sa.String(length=200), nullable=True),
        sa.Column('scheduled_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('cost_estimate', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_trip_activities_trip_stop_id', 'trip_activities', ['trip_stop_id'], unique=False)
    op.create_index('ix_trip_activities_activity_id', 'trip_activities', ['activity_id'], unique=False)
    op.create_index('idx_trip_activities_stop_order', 'trip_activities', ['trip_stop_id', 'order_index'], unique=False)

    # 7. expenses
    op.create_table(
        'expenses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('trip_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('currency', sa.String(length=10), nullable=False, server_default='USD'),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('ix_expenses_trip_id', 'expenses', ['trip_id'], unique=False)
    op.create_index('ix_expenses_category', 'expenses', ['category'], unique=False)
    op.create_index('idx_expenses_trip_category', 'expenses', ['trip_id', 'category'], unique=False)

    # 8. trip_shares
    op.create_table(
        'trip_shares',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('trip_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False),
        sa.Column('share_token', sa.String(length=64), nullable=False),
        sa.Column('share_type', sa.String(length=20), nullable=False, server_default='public'),
        sa.Column('shared_with_email', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_trip_shares_trip_id', 'trip_shares', ['trip_id'], unique=False)
    op.create_index('ix_trip_shares_share_token', 'trip_shares', ['share_token'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_trip_shares_share_token', table_name='trip_shares', if_exists=True)
    op.drop_index('ix_trip_shares_trip_id', table_name='trip_shares', if_exists=True)
    op.drop_table('trip_shares', if_exists=True)

    op.drop_index('idx_expenses_trip_category', table_name='expenses', if_exists=True)
    op.drop_index('ix_expenses_category', table_name='expenses', if_exists=True)
    op.drop_index('ix_expenses_trip_id', table_name='expenses', if_exists=True)
    op.drop_table('expenses', if_exists=True)

    op.drop_index('idx_trip_activities_stop_order', table_name='trip_activities', if_exists=True)
    op.drop_index('ix_trip_activities_activity_id', table_name='trip_activities', if_exists=True)
    op.drop_index('ix_trip_activities_trip_stop_id', table_name='trip_activities', if_exists=True)
    op.drop_table('trip_activities', if_exists=True)

    op.drop_index('idx_trip_stops_trip_order', table_name='trip_stops', if_exists=True)
    op.drop_index('ix_trip_stops_city_id', table_name='trip_stops', if_exists=True)
    op.drop_index('ix_trip_stops_trip_id', table_name='trip_stops', if_exists=True)
    op.drop_table('trip_stops', if_exists=True)

    op.drop_index('ix_trips_user_id', table_name='trips', if_exists=True)
    op.drop_table('trips', if_exists=True)

    op.drop_index('ix_activities_category', table_name='activities', if_exists=True)
    op.drop_index('ix_activities_name', table_name='activities', if_exists=True)
    op.drop_index('ix_activities_city_id', table_name='activities', if_exists=True)
    op.drop_table('activities', if_exists=True)

    op.drop_index('ix_cities_popularity', table_name='cities', if_exists=True)
    op.drop_index('ix_cities_country', table_name='cities', if_exists=True)
    op.drop_index('ix_cities_state', table_name='cities', if_exists=True)
    op.drop_index('ix_cities_name', table_name='cities', if_exists=True)
    op.drop_table('cities', if_exists=True)

    op.drop_index('ix_users_email', table_name='users', if_exists=True)
    op.drop_table('users', if_exists=True)
