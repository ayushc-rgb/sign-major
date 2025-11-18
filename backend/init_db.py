"""Initialize database with correct schema"""
from app.database.db import engine, Base
from app.database.models import ScanHistory

def init_database():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database initialized successfully!")
    print(f"✓ Tables created: {list(Base.metadata.tables.keys())}")

if __name__ == "__main__":
    init_database()

