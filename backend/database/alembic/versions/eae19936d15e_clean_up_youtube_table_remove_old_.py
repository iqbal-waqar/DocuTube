"""Clean up YouTube table - remove old columns and data

Revision ID: eae19936d15e
Revises: 71f39e3d5b90
Create Date: 2025-08-11 02:07:54.206855

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'eae19936d15e'
down_revision: Union[str, None] = '71f39e3d5b90'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Clean up YouTube table - remove all old data and ensure fresh structure
    connection = op.get_bind()
    
    # Step 1: Clear all existing data from youtube_summaries table
    connection.execute(sa.text("DELETE FROM youtube_summaries;"))
    
    # Step 2: Reset the table structure by dropping and recreating it
    # This ensures we have exactly the columns we want with no legacy columns
    
    # Drop the existing table
    op.drop_table('youtube_summaries')
    
    # Recreate the table with the new enhanced structure
    op.create_table('youtube_summaries',
        sa.Column('uuid', sa.String(), nullable=False),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('video_id', sa.String(), nullable=True),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('author', sa.String(), nullable=True),
        sa.Column('channel_id', sa.String(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('published_at', sa.String(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('view_count', sa.Integer(), nullable=True),
        sa.Column('like_count', sa.Integer(), nullable=True),
        sa.Column('comment_count', sa.Integer(), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('category_id', sa.String(), nullable=True),
        sa.Column('thumbnail_url', sa.String(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('uuid')
    )
    
    # Create the index
    op.create_index(op.f('ix_youtube_summaries_uuid'), 'youtube_summaries', ['uuid'], unique=False)


def downgrade() -> None:
    # Downgrade: Drop the new table and recreate the old simple structure
    op.drop_index(op.f('ix_youtube_summaries_uuid'), table_name='youtube_summaries')
    op.drop_table('youtube_summaries')
    
    # Recreate the old simple structure
    op.create_table('youtube_summaries',
        sa.Column('uuid', sa.String(), nullable=False),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=True),
        sa.Column('author', sa.String(), nullable=True),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('uuid')
    )
    op.create_index(op.f('ix_youtube_summaries_uuid'), 'youtube_summaries', ['uuid'], unique=False)
