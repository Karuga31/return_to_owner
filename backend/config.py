import os  # Ensure os is imported for environment variable access

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'mysql://root:@localhost/return_to_owner')  # Update as needed
    SQLALCHEMY_TRACK_MODIFICATIONS = False