import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required
from app.models import *
import pandas as pd
from config import Config
import logging
from collections import OrderedDict  # Assurez-vous que cet import est présent

file_bp = Blueprint('file', __name__)
 
 
 
 
 
 
@file_bp.route('/import/<int:project_id>', methods=['POST'])
def import_database(project_id):
    if 'database' not in request.files:
        return jsonify(message='No file part'), 400

    file = request.files['database']

    if file.filename == '':
        return jsonify(message='No selected file'), 400

    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(filepath)
        
        imported_file = ImportedFile(filename=filename, filepath=filepath, project_id=project_id)
        db.session.add(imported_file)
        db.session.commit()
        
        # Récupérer l'imported_file pour s'assurer que filepath est bien enregistré
        imported_file = ImportedFile.query.filter_by(filename=filename, project_id=project_id).first()

        if imported_file:
            return jsonify(message='Database imported successfully', filepath=imported_file.filepath), 200
        else:
            return jsonify(message='Failed to save database'), 500

    return jsonify(message='File not allowed'), 400
def allowed_file(filename):
    """
    Vérifie si le fichier a une extension autorisée.
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@file_bp.route('/importDL/<int:project_id>', methods=['POST'])
@jwt_required()
def import_databaseDL(project_id):
    if 'database' not in request.files:
        return jsonify(message='No file part'), 400

    file = request.files['database']

    if file.filename == '':
        return jsonify(message='No selected file'), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDERDL'], filename)
        
        # Création du dossier si non existant
        os.makedirs(current_app.config['UPLOAD_FOLDERDL'], exist_ok=True)
        
        try:
            file.save(filepath)
            imported_file = ImportedFileDL(filename=filename, filepath=filepath, project_id=project_id)
            db.session.add(imported_file)
            db.session.commit()

            # Récupération pour vérification
            imported_file =ImportedFileDL.query.filter_by(filename=filename, project_id=project_id).first()
            if imported_file:
                return jsonify(message='Image imported successfully', filepath=imported_file.filepath), 200
            else:
                return jsonify(message='Failed to save image'), 500
        except Exception as e:
            return jsonify(message=f'Error while saving file: {str(e)}'), 500

    return jsonify(message='File not allowed'), 400

 ###################################################
 ##                 ML_Importation                ##   
 ###################################################   
@file_bp.route('/projects/<int:project_id>/imported-files', methods=['GET'])
@jwt_required()
def get_imported_files(project_id):
    # Récupérer le projet en fonction de l'ID
    project = Project.query.get_or_404(project_id)
    
    # Vérification de l'utilisateur
   # if project.user_id != get_jwt_identity():
       # return jsonify(message='Unauthorized access'), 401

    # Récupérer tous les fichiers importés associés au projet
    imported_files = ImportedFile.query.filter_by(project_id=project_id).all()
    if not imported_files:
        logging.warning(f"No files found for project {project_id}")
        return jsonify(message='No files found'), 404

    all_data = []

    def read_file(file_path):
        try:
            # Lire le fichier en fonction de son extension
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif file_path.endswith('.xlsx'):
                try:
                    df = pd.read_excel(file_path)
                except ImportError:
                    logging.error("Missing optional dependency 'openpyxl'. Use pip or conda to install it.")
                    return {"data": [], "last_column_name": None}
            else:
                logging.warning(f"Unsupported file type: {file_path}")
                return []

            # Journaux pour vérifier les données lues
            logging.info(f"Columns: {df.columns.tolist()}")
            logging.info(f"Data preview: \n{df.head()}")

            # Conserver l'ordre des colonnes et transformer en dictionnaires ordonnés
            ordered_columns = df.columns.tolist()
            data = [OrderedDict((col, row[col]) for col in ordered_columns) for row in df.to_dict(orient='records')]
            #logging.info(f"Data after conversion: {data[:5]}")  # Affiche les 5 premiers enregistrements

            # Retourner les données ainsi que le nom de la dernière colonne
            last_column_name = ordered_columns[-1] if ordered_columns else None
            return {"data": data, "last_column_name": last_column_name}
        except Exception as e:
            logging.error(f"Error reading file {file_path}: {str(e)}")
            return {"data": [], "last_column_name": None}

    # Parcourir tous les fichiers importés
    for file in imported_files:
        logging.info(f"Processing file: {file.filepath}")
        file_data = read_file(file.filepath)
        if file_data["data"]:
            all_data.extend(file_data["data"])
        else:
            logging.warning(f"No data found in file: {file.filepath}")

    if not all_data:
        logging.warning("No data was successfully loaded from any files.")
        return jsonify(message='No data available'), 404

    # Inclure le nom de la dernière colonne dans la réponse JSON
    last_column_name = file_data["last_column_name"] if 'last_column_name' in file_data else None
    response_data = {
        "data": all_data,
        "last_column_name": last_column_name
    }
    return jsonify(response_data)
#############################################
def convert_to_serializable(data):
    if isinstance(data, dict):
        return {key: convert_to_serializable(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_to_serializable(item) for item in data]
    elif isinstance(data, (np.int32, np.int64)):
        return int(data)
    elif isinstance(data, (np.float32, np.float64)):
        return float(data)
    else:
        return data
def debug_print_results(results):
    try:
        print(json.dumps(results, indent=2))
    except TypeError as e:
        print(f"Error serializing results: {e}")
        
        
 ###################################################
 ##                 DL_Importation                ##   
 ###################################################    
 