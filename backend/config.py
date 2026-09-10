import os

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/prj'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'supersecretkey'
    SESSION_TYPE = 'filesystem'
    UPLOAD_FOLDER = 'uploadsML/'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    JWT_ACCESS_TOKEN_EXPIRES = False 
    JWT_REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60  # 7 jours
    RESULT_FOLDER = 'result/'
    UPLOAD_FOLDERDL = 'uploadsDL/'  
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}