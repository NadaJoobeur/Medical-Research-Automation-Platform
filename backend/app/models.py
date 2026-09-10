from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(500), nullable=False)
    projects = db.relationship('Project', backref='user', cascade="all, delete-orphan", lazy=True)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    typePrj = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ##############################
    #           ML               #
    ##############################
    imported_files = db.relationship('ImportedFile', backref='project', cascade="all, delete-orphan", lazy=True)
    targetfeature=db.relationship('TargetFeature', backref='project', cascade="all, delete-orphan", lazy=True)
    modifiedfile=db.relationship('ModifiedFile', backref='project', cascade="all, delete-orphan", lazy=True)
    models=db.relationship('Models', backref='project', cascade="all, delete-orphan", lazy=True)
    ##############################
    #           DL               #
    ##############################
    imported_filesDL = db.relationship('ImportedFileDL', backref='project', cascade="all, delete-orphan", lazy=True)
    normalized_files = db.relationship('NormalizedFile', backref='project', cascade="all, delete-orphan", lazy=True)
     # Relation avec ResizedFile
    resized_files = db.relationship('ResizedFile', backref='project', cascade="all, delete-orphan", lazy=True)
    # Relation avec SlicingFile
    slicing_files = db.relationship('SlicingFile', backref='project', cascade="all, delete-orphan", lazy=True)
    # Relation avec ResultatFile (au lieu de la seconde référence à SlicingFile)
    resulting_files = db.relationship('ResultatFile', backref='project', cascade="all, delete-orphan", lazy=True)
    historique = db.relationship('Historique', backref='project', cascade="all, delete-orphan", lazy=True)

class ImportedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(300), nullable=False)
    filepath = db.Column(db.String(300), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    
    
class TargetFeature(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    
class ModifiedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(300), nullable=False)
    filepath = db.Column(db.String(300), nullable=False)  
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)

class Models(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    modelname = db.Column(db.String(300), nullable=False)
    modelpath = db.Column(db.String(300), nullable=False)  
    validpath= db.Column(db.String(300), nullable=False)  
    Accuracy=db.Column(db.Float, nullable=False)  
    Precisionn=db.Column(db.Float, nullable=False)  
    Recall=db.Column(db.Float, nullable=False)  
    F1_Score=db.Column(db.Float, nullable=False)  
    ROC_AUC=db.Column(db.Float, nullable=False)  
    MeanAbsoluteError=db.Column(db.Float, nullable=False)  
    MeanSquaredError=db.Column(db.Float, nullable=False)  
    RScore=db.Column(db.Float, nullable=False)  
    featureimportance=db.Column(db.String(300), nullable=False) 
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    trainingset = db.Column(db.Integer, nullable=True)
    testset = db.Column(db.Integer, nullable=True)
    k = db.Column(db.Integer, nullable=True)

class ImportedFileDL(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(300), nullable=False)
    filepath = db.Column(db.String(300), nullable=False)  # Nouveau champ pour le chemin complet du fichier
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)

class NormalizedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(300), nullable=False)
    filepath = db.Column(db.String(300), nullable=False)  # Nouveau champ pour le chemin complet du fichier
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
   

class ResizedFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)  # Chemin complet du fichier redimensionné
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)

class SlicingFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    resizedname = db.Column(db.String(255), nullable=False)  # Colonne ajoutée

class ResultatFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)


class Historique(db.Model):

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    url = db.Column(db.String(10000), nullable=False)
    normalised = db.Column(db.String(200), default='FALSE')
    sliced = db.Column(db.String(200), default='FALSE')
    resized = db.Column(db.String(200), default='FALSE')
    name = db.Column(db.String(50), default='FALSE')
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)