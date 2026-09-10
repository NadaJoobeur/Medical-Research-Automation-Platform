from flask import Blueprint, request, jsonify, current_app
import os
import pandas as pd
import logging
import datetime
import numpy as np
from flask import jsonify, request
from app.models import *
from flask import Flask, request, jsonify, session, redirect, url_for,send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from flask_login import LoginManager, login_user, current_user, logout_user, login_required, UserMixin
from werkzeug.utils import secure_filename
import pandas as pd
import base64
import numpy as np
from PIL import Image
import logging
import matplotlib.pyplot as plt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from PIL import Image
import cv2
from tensorflow.keras.models import load_model
from tensorflow.keras import backend as K
from tensorflow.keras.losses import binary_crossentropy
import tensorflow as tf
from pathlib import Path
from sqlalchemy.orm.exc import NoResultFound

NORMALIZED_IMAGE_FOLDER = 'norm/'
Resized_IMAGE_FOLDER = 'resized/'
Sliced_IMAGE_FOLDER = 'Slice/'
RESULT_FOLDER = 'result/'
dl_routes = Blueprint('dl_routes', __name__)
def allowed_file(filename):
    """
    Vérifie si le fichier a une extension autorisée.
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@dl_routes.route('/import-database/<int:project_id>', methods=['POST'])
@jwt_required()
def import_database(project_id):
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
            imported_file = ImportedFileDL.query.filter_by(filename=filename, project_id=project_id).first()
            if imported_file:
                return jsonify(message='Image imported successfully', filepath=imported_file.filepath), 200
            else:
                return jsonify(message='Failed to save image'), 500
        except Exception as e:
            return jsonify(message=f'Error while saving file: {str(e)}'), 500

    return jsonify(message='File not allowed'), 400






@dl_routes.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDERDL'], filename)


@dl_routes.route('/projects/<int:project_id>/imported-files', methods=['GET'])
@jwt_required()
def get_imported_files(project_id):
    project = Project.query.get_or_404(project_id)
    if project.user_id != get_jwt_identity():
        return jsonify(message='Unauthorized access'), 401

    imported_files = ImportedFileDL.query.filter_by(project_id=project_id).all()

    # Liste des URLs des fichiers importés
    image_urls = []

    for file in imported_files:
        # Génération de l'URL pour chaque fichier
        file_url = url_for('dl_routes.serve_uploaded_file', filename=file.filename)
        image_urls.append({'url': file_url})
    
    logging.info(image_urls)
    return jsonify(image_urls)

@dl_routes.route('/projects/<int:project_id>/imported-file-details', methods=['GET'])
@jwt_required()
def get_imported_file_details(project_id):
    project = Project.query.get_or_404(project_id)
    if project.user_id != get_jwt_identity():
        return jsonify(message='Unauthorized access'), 401

    imported_files = ImportedFileDL.query.filter_by(project_id=project_id).all()
    file_details = []

    for file in imported_files:
        file_path = os.path.join(current_app.config['UPLOAD_FOLDERDL'], file.filename)

        # Ouvrir l'image pour extraire les détails
        with Image.open(file_path) as img:
            # Dimensions
            dimensions = f"{img.width} x {img.height}"
            # Nombre de canaux
            num_channels = len(img.getbands())
            # Plage d'intensité des pixels
            intensity_range = f"{np.min(img)} - {np.max(img)}"
           
            # Taille du fichier en Mo
            file_size = os.path.getsize(file_path) / (1024 * 1024)

        file_details.append({
            'filename': file.filename,
            'dimensions': dimensions,
            'num_channels': num_channels,
            'intensity_range': intensity_range,
            'file_size': file_size
        })

    return jsonify(file_details)

###################################################################
def normalize_image_min_max(image_path):
    try:
        if image_path.endswith('.npy'):
            print(f"Loading .npy file from path: {image_path}")
            image_np = np.load(image_path, allow_pickle=False)
        else:
            print(f"Loading image file from path: {image_path}")
            image = Image.open(image_path).convert('RGB')
            image_np = np.array(image)

        if image_np is None or image_np.size == 0:
            raise ValueError(f"Loaded image is empty from path: {image_path}")

        print(f"Loaded image shape: {image_np.shape}")

        # Normalisation (normaliser entre 0 et 1)
        normalized_image = image_np / 255.0
        
        print(f"Image normalized from path: {image_path}")
        return normalized_image, normalized_image.shape
    except Exception as e:
        print(f"Error in normalize_image_min_max function for image {image_path}: {e}")
        raise
def normalize_image_zscore(image_path):
    try:
        # Vérifiez si c'est un fichier .npy ou une image classique
        if image_path.endswith('.npy'):
            print(f"Loading .npy file from path: {image_path}")
            image_np = np.load(image_path, allow_pickle=False)
        else:
            print(f"Loading image file from path: {image_path}")
            image = Image.open(image_path).convert('RGB')
            image_np = np.array(image)

        if image_np is None or image_np.size == 0:
            raise ValueError(f"Loaded image is empty from path: {image_path}")

        print(f"Loaded image shape: {image_np.shape}")

        # Calculer la moyenne et l'écart type
        mean = np.mean(image_np)
        std = np.std(image_np)

        # Normaliser l'image en utilisant la normalisation Z-score
        standardized_image = (image_np - mean) / std
        
        print(f"Image standardized from path: {image_path}")
        return standardized_image, standardized_image.shape
    except Exception as e:
        print(f"Error in normalize_image_zscore function for image {image_path}: {e}")
        raise

def normalize_image_channelwise(image_path):
    try:
        # Charger l'image en tant que tableau NumPy
        if image_path.endswith('.npy'):
            print(f"Loading .npy file from path: {image_path}")
            image_np = np.load(image_path, allow_pickle=False)
        else:
            print(f"Loading image file from path: {image_path}")
            image = Image.open(image_path).convert('RGB')
            image_np = np.array(image)

        if image_np is None or image_np.size == 0:
            raise ValueError(f"Loaded image is empty from path: {image_path}")

        print(f"Loaded image shape: {image_np.shape}")

        # Traitement pour les images 1D
        if len(image_np.shape) == 1:
            # Supposer que l'image est aplatie, reformer en une image 2D
            side_len = int(np.sqrt(image_np.size))  # Suppose une image carrée
            image_np = image_np.reshape((side_len, side_len))
            print(f"Reshaped 1D image to 2D with shape: {image_np.shape}")

        # Traitement pour les images 2D en niveaux de gris
        if len(image_np.shape) == 2:
            # Convertir l'image en RGB en ajoutant une dimension de canal
            image_np = np.expand_dims(image_np, axis=-1)
            image_np = np.repeat(image_np, 3, axis=-1)
            print(f"Converted grayscale image to RGB with shape: {image_np.shape}")

        # Traitement pour les images RGB
        if len(image_np.shape) == 3 and image_np.shape[-1] == 3:
            channels = [image_np[:, :, i] for i in range(3)]
        else:
            raise ValueError(f"Unsupported image shape: {image_np.shape}")

        # Normaliser chaque canal par min-max
        normalized_channels = []
        for channel in channels:
            min_val = np.min(channel)
            max_val = np.max(channel)
            if max_val - min_val == 0:  # éviter la division par zéro
                normalized_channel = np.zeros_like(channel)
            else:
                normalized_channel = (channel - min_val) / (max_val - min_val)
            normalized_channels.append(normalized_channel)

        # Recomposer l'image avec les canaux normalisés
        normalized_image = np.stack(normalized_channels, axis=-1)

        print(f"Image channel-wise normalized from path: {image_path}")
        return normalized_image, normalized_image.shape
    except Exception as e:
        print(f"Error in normalize_image_channelwise function for image {image_path}: {e}")
        raise

def save_normalized_image(normalized_image_np, filename):
    try:
        # Check if normalized_image_np is a NumPy array
        if not isinstance(normalized_image_np, np.ndarray):
            raise TypeError(f"Expected a NumPy array, got {type(normalized_image_np)}")
        # Obtenez l'extension actuelle du fichier (ex. .jpg, .png, etc.)
        file_extension = os.path.splitext(filename)[1]

        # Remplacez l'extension par .npy
        # Define the path for saving the .npy file
        normalized_path = os.path.join(NORMALIZED_IMAGE_FOLDER, filename.replace(file_extension, '.npy'))
        
        # Sauvegarder le tableau NumPy dans un fichier .npy
        print(f"Saving normalized image array to {normalized_path}")
        np.save(normalized_path, normalized_image_np)
        
        print(f"Saved normalized image to {normalized_path}")
        return normalized_path
    except Exception as e:
        print(f"Error in save_normalized_image function for filename {filename}: {e}")
        raise

import logging

@dl_routes.route('/normalize_stored/<int:project_id>', methods=['POST'])
@jwt_required()
def normalize_stored_images(project_id):
    project = Project.query.get_or_404(project_id)
    if project.user_id != get_jwt_identity():
        return jsonify(message='Unauthorized access'), 401

    data = request.get_json()
    normalization_method = data.get('normalization_method', 'min_max')  # Default to 'min_max' if not specified
    last_fnct = data.get('last_fnct', '')
    nbr = data.get('nbrIm')
    treated_img = data.get('treated_img', "")
    file_id = data.get('fileId')
    print(f"Normalization method: {normalization_method}")
    print(f"Last function: {last_fnct}")
    print(f"aaa{nbr}")
    print(f"data_treated: {treated_img}, Type: {type(treated_img)}")
    print(f"File ID: {file_id}")
    urls = []
    normalized_images = []
    dimension_changes = set()  # To track dimension variations
    
    if treated_img:
        # Si treated_img est une chaîne, la convertir en liste
        
        if isinstance(treated_img, str):
            try:
                # Convertir la chaîne JSON en liste Python
                treated_img = json.loads(treated_img)
                print(f"Conversion réussie: {treated_img}")
            except json.JSONDecodeError:
                print("Erreur lors du décodage JSON")
                return jsonify({'error': 'Invalid format for treated_img'}), 400

        # Vérifier après conversion si c'est bien une liste
        print(f"Images traitées (après correction): {treated_img}, Type: {type(treated_img)}")
        try:
            files_to_process = json.loads(treated_img)
            if not isinstance(files_to_process, list):
                raise ValueError('La chaîne JSON ne contient pas une liste valide.')
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Erreur lors de la conversion JSON : {e}")
            files_to_process = []
        print(f"Images traitées (après correction): {files_to_process}, Type: {type(files_to_process)}")

        for image_path in files_to_process:
            try:  

                print(f"Processing file: {image_path}")

                if not os.path.exists(image_path):
                    raise FileNotFoundError(f"File not found: {image_path}")

                if normalization_method == 'z_score':
                    normalized_image_np, new_dims = normalize_image_zscore(image_path)
                elif normalization_method == 'channelwise':
                    normalized_image_np, new_dims = normalize_image_channelwise(image_path)
                else:
                    normalized_image_np, new_dims = normalize_image_min_max(image_path)  # Default to min-max

                dimension_changes.add(str(new_dims))  # Convert tuple to string for easy storage
                normalized_path = save_normalized_image(normalized_image_np, os.path.basename(image_path))
                file_extension = os.path.splitext(os.path.basename(image_path))[1]
                normalized_file = NormalizedFile(
                    filename=os.path.basename(image_path).replace(file_extension, '.npy'),
                    filepath=normalized_path,
                    project_id=project_id
                )

                db.session.add(normalized_file)
                db.session.commit()

                normalized_images.append({'filename': os.path.basename(image_path).replace(file_extension, '.npy'), 'path': normalized_path})
                urls.append(normalized_path)

            except FileNotFoundError as e:
                print(f"FileNotFoundError: {str(e)}")
                return jsonify({'error': f'Error processing image: {str(e)}'}), 404
            except Exception as e:
                print(f"Exception: {str(e)}")
                db.session.rollback()
                return jsonify({'error': f'Error processing image: {str(e)}'}), 500
        
        
    
    else:
        # Choisir les fichiers à normaliser en fonction de last_fnct
        if last_fnct == 'resizing':
            files_to_process = ResizedFile.query.filter_by(project_id=project_id).all()
        elif last_fnct == 'slicing':
            files_to_process = SlicingFile.query.filter_by(project_id=project_id).all()
        else:
            files_to_process = ImportedFileDL.query.filter_by(project_id=project_id).all()
        files_to_process = files_to_process[-nbr:]

        if not files_to_process:
            return jsonify({'error': 'No files found for this project'}), 404

        for file in files_to_process:
            try:
                image_path = file.filepath

                print(f"Processing file: {image_path}")

                if not os.path.exists(image_path):
                    raise FileNotFoundError(f"File not found: {image_path}")

                if normalization_method == 'z_score':
                    normalized_image_np, new_dims = normalize_image_zscore(image_path)
                elif normalization_method == 'channelwise':
                    normalized_image_np, new_dims = normalize_image_channelwise(image_path)
                else:
                    normalized_image_np, new_dims = normalize_image_min_max(image_path)  # Default to min-max

                dimension_changes.add(str(new_dims))  # Convert tuple to string for easy storage
                normalized_path = save_normalized_image(normalized_image_np, file.filename)
                file_extension = os.path.splitext(file.filename)[1]
                normalized_file = NormalizedFile(
                    filename=file.filename.replace(file_extension, '.npy'),
                    filepath=normalized_path,
                    project_id=project_id
                )

                db.session.add(normalized_file)
                db.session.commit()

                normalized_images.append({'filename': file.filename.replace(file_extension, '.npy'), 'path': normalized_path})
                urls.append(normalized_path)
        

            except FileNotFoundError as e:
                print(f"FileNotFoundError: {str(e)}")
                return jsonify({'error': f'Error processing image: {str(e)}'}), 404
            except Exception as e:
                print(f"Exception: {str(e)}")
                db.session.rollback()
                return jsonify({'error': f'Error processing image: {str(e)}'}), 500
    return jsonify({
    'normalizationStatus': 'Normalization applied successfully',
    'normalizedImagesCount': len(normalized_images),
    'dimensionVariation': str(dimension_changes),
    'normalizationTechnique': normalization_method,
    'urls': urls
    })
    


######################################################################"

def resize_image(npy_path, target_size):
    try:
        # Vérifiez si c'est un fichier .npy ou une image classique
        if npy_path.endswith('.npy'):
            # Si c'est un fichier .npy, le charger avec numpy
            print(f"Loading .npy file from path: {npy_path}")
            image_array = np.load(npy_path, allow_pickle=True)
        else:
            # Si c'est une image (par exemple, PNG, JPG), la charger avec PIL
            print(f"Loading image file from path: {npy_path}")
            image = Image.open(npy_path)
            image_array = np.array(image)

        # Vérifier que l'image est bien chargée
        if image_array is None or image_array.size == 0:
            raise ValueError(f"Loaded image is empty from path: {npy_path}")
        
        print(f"Loaded image shape: {image_array.shape}")

        # Redimensionner l'image
        img_resized = cv2.resize(image_array, target_size, interpolation=cv2.INTER_LINEAR)
        print(f"Image resized to {target_size}")

        return img_resized
    except FileNotFoundError as fnf_error:
        print(f"File not found: {npy_path}")
        raise
    except Exception as e:
        print(f"Error in resize_image function for image {npy_path}: {e}")
        raise

def save_resized_image(resized_image_np, filename):
    try:
        # Check if resized_image_np is a NumPy array
        if not isinstance(resized_image_np, np.ndarray):
            raise TypeError(f"Expected a NumPy array, got {type(resized_image_np)}")

        file_extension = os.path.splitext(filename)[1]

        # Remplacez l'extension par .npy
        # Define the path for saving the .npy file
        resized_path = os.path.join(Resized_IMAGE_FOLDER, filename.replace(file_extension, '.npy'))

        # Sauvegarder l'image redimensionnée en .npy
        print(f"Saving resized image array to {resized_path}")
        np.save(resized_path, resized_image_np)

        print(f"Saved resized image to {resized_path}")
        return resized_path
    except Exception as e:
        print(f"Error in save_resized_image function for filename {filename}: {e}")
        raise

@dl_routes.route('/resize_stored/<int:project_id>', methods=['POST'])
@jwt_required()
def resize_stored_images(project_id):
    project = Project.query.get_or_404(project_id)
    if project.user_id != get_jwt_identity():
        return jsonify(message='Unauthorized access'), 401

    data = request.get_json()
    last_fnct = data.get('last_fnct', '')
    longeur = int(data.get('longeur', 256))
    largeur = int(data.get('largeur', 256))
    treated_img = data.get('treated_img', "")

    # Affichage des valeurs et de leurs types
    print(f"Longueur: {longeur}, Type: {type(longeur)}")
    print(f"Largeur: {largeur}, Type: {type(largeur)}")
    print(f"data_treated: {treated_img}, Type: {type(treated_img)}")

    # Convertir nbr en entier (défaut à 10)
    nbr_im = data.get('nbrIm', [10])  # Valeur par défaut si 'nbrIm' est absent
    if isinstance(nbr_im, list):
        if len(nbr_im) > 0:
            nbr = int(nbr_im[0])  # Prendre le premier élément de la liste
        else:
            nbr = 10  # Valeur par défaut si la liste est vide
    else:
        nbr = int(nbr_im)  # Si ce n'est pas une liste, essayer de convertir directement  # Par défaut, redimensionner les 10 dernières images
    urls = []
    resized_images = []
    original_dimensions = []

    if treated_img:
        # Si treated_img est une chaîne, la convertir en liste
        if isinstance(treated_img, str):
            try:
                # Convertir la chaîne JSON en liste Python
                treated_img = json.loads(treated_img)
                print(f"Conversion réussie: {treated_img}")
            except json.JSONDecodeError:
                print("Erreur lors du décodage JSON")
                return jsonify({'error': 'Invalid format for treated_img'}), 400

        # Vérifier après conversion si c'est bien une liste
        print(f"Images traitées (après correction): {treated_img}, Type: {type(treated_img)}")
        try:
            files_to_process = json.loads(treated_img)
            if not isinstance(files_to_process, list):
                raise ValueError('La chaîne JSON ne contient pas une liste valide.')
        except (json.JSONDecodeError, ValueError) as e:
            print(f"Erreur lors de la conversion JSON : {e}")
            files_to_process = []
        print(f"Images traitées (après correction): {files_to_process}, Type: {type(files_to_process)}")
        for image_path in files_to_process:
            print(f"Traitement de l'image:",image_path)
            try:
                # Vérification de l'existence du fichier
                if not os.path.exists(image_path):
                    raise FileNotFoundError(f"File not found: {image_path}")

                # Chargement de l'image
                if image_path.endswith('.npy'):
                    print(f"Chargement du fichier .npy: {image_path}")
                    image_np = np.load(image_path, allow_pickle=True)
                else:
                    print(f"Chargement de l'image: {image_path}")
                    image = Image.open(image_path)
                    image_np = np.array(image)

                print(f"Forme de l'image chargée: {image_np.shape}")

                # Sauvegarder les dimensions originales
                original_dimensions.append(image_np.shape)

                # Redimensionner l'image
                resized_image_np = resize_image(image_path, target_size=(longeur, largeur))

                # Sauvegarder l'image redimensionnée
                filename = os.path.basename(image_path)  # Utiliser le nom du fichier sans chemin
                resized_path = save_resized_image(resized_image_np, filename)
                print(f"Image redimensionnée enregistrée: {resized_path}")

                # Enregistrer les informations sur l'image redimensionnée dans la base de données
                file_extension = os.path.splitext(filename)[1]
                resized_file = ResizedFile(
                    filename=filename.replace(file_extension, '.npy'),
                    filepath=resized_path,
                    project_id=project_id
                )
                db.session.add(resized_file)
                db.session.commit()

                resized_images.append({
                    'filename': filename.replace(file_extension, '.npy'),
                    'path': resized_path,
                    'dimensions': resized_image_np.shape
                })
                urls.append(resized_path)

            except FileNotFoundError as e:
                print(f"Erreur: {e}")
                return jsonify({'error': f'Error processing image: {str(e)}'}), 404
            except Exception as e:
                print(f"Erreur: {e}")
                db.session.rollback()
                return jsonify({'error': f'Error processing image: {str(e)}'}), 500
    else:
        # Sélectionner les fichiers à redimensionner en fonction de last_fnct
        if last_fnct == 'normalizing':
            files_to_process = NormalizedFile.query.filter_by(project_id=project_id).all()
        elif last_fnct == 'slicing':
            files_to_process = SlicingFile.query.filter_by(project_id=project_id).all()
        else:
            files_to_process = ImportedFileDL.query.filter_by(project_id=project_id).all()

        # Traiter seulement le nombre spécifié d'images
        
        files_to_process = files_to_process[-nbr:]  
        print(f"Nombre d'images à traiter: {len(files_to_process)}")

        for file in files_to_process:
            image_path = file.filepath
            print(f"Traitement du fichier: {image_path}")
            try:
                if not os.path.exists(image_path):
                    raise FileNotFoundError(f"File not found: {image_path}")

                # Chargement de l'image
                if image_path.endswith('.npy'):
                    print(f"Chargement du fichier .npy: {image_path}")
                    image_np = np.load(image_path, allow_pickle=True)
                else:
                    print(f"Chargement de l'image: {image_path}")
                    image = Image.open(image_path)
                    image_np = np.array(image)

                print(f"Forme de l'image chargée: {image_np.shape}")

                # Sauvegarder les dimensions originales
                original_dimensions.append(image_np.shape)

                # Redimensionner l'image
                resized_image_np = resize_image(image_path, target_size=(longeur, largeur))

                # Sauvegarder l'image redimensionnée
                filename = os.path.basename(image_path)
                resized_path = save_resized_image(resized_image_np, filename)
                print(f"Image redimensionnée enregistrée: {resized_path}")

                # Enregistrer les informations sur l'image redimensionnée dans la base de données
                file_extension = os.path.splitext(filename)[1]
                resized_file = ResizedFile(
                    filename=filename.replace(file_extension, '.npy'),
                    filepath=resized_path,
                    project_id=project_id
                )
                db.session.add(resized_file)
                db.session.commit()

                resized_images.append({
                    'filename': filename.replace(file_extension, '.npy'),
                    'path': resized_path,
                    'dimensions': resized_image_np.shape
                })
                urls.append(resized_path)

            except FileNotFoundError as e:
                print(f"Erreur: {e}")
                return jsonify({'error': f'Error processing image: {str(e)}'}), 404
            except Exception as e:
                print(f"Erreur: {e}")
                db.session.rollback()
                return jsonify({'error': f'Error processing image: {str(e)}'}), 500

    # Calculer la plage de variation des dimensions des images avant redimensionnement
    if original_dimensions:
        min_dimensions = np.min(original_dimensions, axis=0)
        max_dimensions = np.max(original_dimensions, axis=0)
        min_dimensions_list = min_dimensions.tolist()
        max_dimensions_list = max_dimensions.tolist()
    else:
        min_dimensions_list = []
        max_dimensions_list = []

    # Affichage des détails
    print(f"Nombre d'images redimensionnées: {len(resized_images)}")
    print(f"Plage des dimensions avant redimensionnement: Min={min_dimensions_list}, Max={max_dimensions_list}")

    return jsonify({
        'resizedImages': resized_images,
        'status': 'Resized images successfully processed',
        'numberOfImagesResized': len(resized_images),
        'dimensionRangeBeforeResize': {
            'min_dimensions': min_dimensions_list,
            'max_dimensions': max_dimensions_list
        },
        'urls': urls
    }), 200


#################################################################""""
def slice_image(image_np, num_slices_x=2, num_slices_y=2):
    print("Dimensions de l'image:", image_np.shape)
    slices = []
    h, w = image_np.shape[:2]
    slice_h, slice_w = h // num_slices_y, w // num_slices_x
    
    for i in range(num_slices_y):
        for j in range(num_slices_x):
            slice_img = image_np[i*slice_h:(i+1)*slice_h, j*slice_w:(j+1)*slice_w]
            slices.append(slice_img)
            print(f"Tranche {len(slices)} créée avec dimensions {slice_img.shape}")
    
    slice_dims = {
        'width': slice_w,
        'height': slice_h,
    }
    
    print(f"Nombre total de tranches: {len(slices)}")
    print(f"Dimensions de chaque tranche: {slice_dims}")
    print(f"Type du slice {type(slices)} ")
    
    return slices, slice_dims


import os
import numpy as np

def save_slices(slices, filename, slice_folder=Sliced_IMAGE_FOLDER):
    try:
        # Créer le répertoire si nécessaire
        if not os.path.exists(slice_folder):
            os.makedirs(slice_folder)
            print(f"Le dossier {slice_folder} a été créé.")
        
        # Extraire le nom de base du fichier sans extension
        base_filename = os.path.splitext(os.path.basename(filename))[0]
        saved_paths = []
        
        # Sauvegarder chaque tranche
        for idx, slice_img in enumerate(slices):
            slice_filename = f"{base_filename}_slice_{idx+1}.npy"
            slice_path = os.path.join(slice_folder, slice_filename)
            
            # Enregistrer la tranche dans le répertoire spécifié
            try:
                np.save(slice_path, slice_img)
                print(f"Tranche sauvegardée: {slice_path}")
                saved_paths.append(slice_path)
            except Exception as e:
                print(f"Erreur lors de la sauvegarde de la tranche {idx+1}: {e}")
                raise
        
        print(f"Chemins des tranches sauvegardées: {saved_paths}")
        return saved_paths

    except Exception as e:
        print(f"Erreur lors de la sauvegarde des tranches: {e}")
        raise

    
@dl_routes.route('/slice-image/<int:project_id>', methods=['POST']) 
@jwt_required()
def slice_image_endpoint(project_id):
    print(f"ID du projet reçu: {project_id}")
    
    try:
        project = Project.query.get_or_404(project_id)
        
        if project.user_id != get_jwt_identity():
            return jsonify(message='Unauthorized access'), 401

        data = request.get_json()
        last_fnct = data.get('last_fnct', '')
        slice_x = int(data.get('slice_x', 2))
        slice_y = int(data.get('slice_y', 2))
        nbr= data.get('nbrIm')
        treated_img = data.get('treated_img', "")
        print(f"data_treated: {treated_img}, Type: {type(treated_img)}")
        sliced_images = []
        total_slices = 0
        dimensions_before = None
        dimensions_after = None

        if treated_img:
            # Si treated_img est une chaîne, la convertir en liste
            if isinstance(treated_img, str):
                try:
                    # Convertir la chaîne JSON en liste Python
                    treated_img = json.loads(treated_img)
                    print(f"Conversion réussie: {treated_img}")
                except json.JSONDecodeError:
                    print("Erreur lors du décodage JSON")
                    return jsonify({'error': 'Invalid format for treated_img'}), 400

            # Vérifier après conversion si c'est bien une liste
            print(f"Images traitées (après correction): {treated_img}, Type: {type(treated_img)}")
            try:
                files_to_process = json.loads(treated_img)
                if not isinstance(files_to_process, list):
                    raise ValueError('La chaîne JSON ne contient pas une liste valide.')
            except (json.JSONDecodeError, ValueError) as e:
                print(f"Erreur lors de la conversion JSON : {e}")
                files_to_process = []
            print(f"Images traitées (après correction): {files_to_process}, Type: {type(files_to_process)}")
            for image_path in files_to_process:
                try:
                    if not os.path.exists(image_path):
                        print(f"Le fichier n'existe pas: {image_path}")
                        raise FileNotFoundError(f"Le fichier n'existe pas: {image_path}")

                    if image_path.endswith('.npy'):
                        image_np = np.load(image_path)
                    else:
                        image = Image.open(image_path)
                        image_np = np.array(image)
                        
                    print("Image chargée avec succès en tant que tableau NumPy avec dimensions:", image_np.shape)
                    
                    if image_np.dtype != np.float32:
                        image_np = image_np.astype(np.float32) / np.max(image_np)
                    print(f"image shape: {image_np.shape}")

                    if len(image_np.shape) == 3 and image_np.shape[2] == 3:
                        image_np = np.mean(image_np, axis=-1)
                    elif len(image_np.shape) == 2:
                        pass
                    print(f"image shape after grayscaling: {image_np.shape}")

                    if dimensions_before is None:
                        dimensions_before = image_np.shape

                    slices,dim = slice_image(image_np, slice_x, slice_y)
                    total_slices += len(slices)
                    
                    if dimensions_after is None:
                        dimensions_after = dim

                    saved_paths = save_slices(slices, image_path)
                    print(f"Chemins des tranches sauvegardées: {saved_paths}")
                    
                    for p in saved_paths:
                        slicing_file = SlicingFile(
                            filename=os.path.basename(p),
                            filepath=p,
                            project_id=project_id,
                            resizedname=os.path.basename(p)
                        )
                        db.session.add(slicing_file)
                        db.session.commit()
                        sliced_images.append(p)

                except Exception as e:
                    db.session.rollback()
                    print(f"Erreur lors du découpage de l'image pour {os.path.basename(p)}: {e}")
                    return jsonify({'error': f'Error slicing image: {str(e)}'}), 500
                
        else:

            if last_fnct == 'normalizing':
                files_to_process = NormalizedFile.query.filter_by(project_id=project_id).all()
            elif last_fnct == 'resizing':
                files_to_process = ResizedFile.query.filter_by(project_id=project_id).all()
            else:
                files_to_process = ImportedFileDL.query.filter_by(project_id=project_id).all()
            files_to_process = files_to_process[-nbr:]

            if not files_to_process:
                return jsonify({'error': 'No files found for this project'}), 404
            
            
            for file in files_to_process:
                try:
                    image_path = file.filepath
                    if not os.path.exists(image_path):
                        print(f"Le fichier n'existe pas: {image_path}")
                        raise FileNotFoundError(f"Le fichier n'existe pas: {image_path}")

                    if image_path.endswith('.npy'):
                        image_np = np.load(image_path)
                    else:
                        image = Image.open(image_path)
                        image_np = np.array(image)
                        
                    print("Image chargée avec succès en tant que tableau NumPy avec dimensions:", image_np.shape)
                    
                    if image_np.dtype != np.float32:
                        image_np = image_np.astype(np.float32) / np.max(image_np)
                    print(f"image shape: {image_np.shape}")

                    if len(image_np.shape) == 3 and image_np.shape[2] == 3:
                        image_np = np.mean(image_np, axis=-1)
                    elif len(image_np.shape) == 2:
                        pass
                    print(f"image shape after grayscaling: {image_np.shape}")

                    if dimensions_before is None:
                        dimensions_before = image_np.shape

                    slices,dim = slice_image(image_np, slice_x, slice_y)
                    total_slices += len(slices)
                    
                    if dimensions_after is None:
                        dimensions_after = dim

                    saved_paths = save_slices(slices, image_path)
                    print(f"Chemins des tranches sauvegardées: {saved_paths}")
                    
                    for p in saved_paths:
                        slicing_file = SlicingFile(
                            filename=os.path.basename(p),
                            filepath=p,
                            project_id=project_id,
                            resizedname=file.filename
                        )
                        db.session.add(slicing_file)
                        db.session.commit()
                        sliced_images.append(p)

                except Exception as e:
                    db.session.rollback()
                    print(f"Erreur lors du découpage de l'image pour {file.filename}: {e}")
                    return jsonify({'error': f'Error slicing image: {str(e)}'}), 500

        return jsonify({
            'slicedImages': sliced_images,
            'totalSlices': total_slices,
            'dimensionsBefore': dimensions_before,
            'dimensionsAfter': dimensions_after,
            'status': 'success',
            'urls':sliced_images
        }), 200
    
    except Exception as e:
        print(f"Erreur générale dans la route '/slice-image/{project_id}': {e}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

################################################################################
# Dice Coefficient
def dice_coefficient(y_true, y_pred, smooth=1e-6):
    y_true_f = K.flatten(y_true)
    y_pred_f = K.flatten(y_pred)
    intersection = K.sum(y_true_f * y_pred_f)
    return 1 - (2. * intersection + smooth) / (K.sum(y_true_f) + K.sum(y_pred_f) + smooth)
def binary_crossentropy(y_true, y_pred):
    return tf.keras.losses.binary_crossentropy(y_true, y_pred)

def combined_loss(y_true, y_pred):
    return binary_crossentropy(y_true, y_pred) + dice_coefficient(y_true, y_pred)
def recall(y_true, y_pred):
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    possible_positives = K.sum(K.round(K.clip(y_true, 0, 1)))
    return true_positives / (possible_positives + K.epsilon())

MODEL_PATH = 'routes/model/best_model.keras'
model = load_model(MODEL_PATH, custom_objects={
    'dice_coefficient': dice_coefficient,
    'recall': recall,
    'combined_loss': combined_loss
})
import json  # Assurez-vous que cette ligne est au début de votre script
@dl_routes.route('/version_1/slice-images', methods=['POST'])
@jwt_required()
def version():
    data = request.get_json()
    sliced_images = data.get('slicedImages', [])
    logging.info(f'Type de sliced_images : {type(sliced_images)}')

    if isinstance(sliced_images, str):
        try:
            sliced_images = json.loads(sliced_images)
            logging.info(f'Liste convertie : {sliced_images}')
        except json.JSONDecodeError as e:
            logging.error(f'Erreur lors du chargement JSON : {e}')
    else:
        logging.info(f'Données non converties : {sliced_images}') 
    project_id = data.get('project_id')
    
    if isinstance(sliced_images, str):
        try:
            sliced_images = json.loads(sliced_images)
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            return jsonify({"error": "Invalid JSON format"}), 400
    
    uploaded_files = []
    for file in sliced_images:
        try:
            img = np.load(file)
            uploaded_files.append(img)
        except Exception as e:
            print(f"Error loading file {file}: {e}")
            return jsonify({"error": f"Error loading file {file}"}), 400

    try:
        # Check if model is callable
        if not callable(getattr(model, 'predict', None)):
            raise TypeError("Model is not callable or does not have a 'predict' method")
        
        train_data = np.array(uploaded_files)
        train_data = np.expand_dims(train_data, axis=-1)
        train_data = np.transpose(train_data, (0, 3, 1, 2))
        train_data = np.nan_to_num(train_data)

        print("Starting model prediction")
        predictions = model.predict(train_data)
        print("Model prediction completed")
        
        # Ensure predictions are in the correct format
        predictions = np.array(predictions)
        print(f"Shape of predictions: {predictions.shape}")
        print(f"Shape of predictions: {type(predictions)}")
        original_shape = (256, 256)
        num_slices_x = 2
        num_slices_y = 2
        test_preds_reconstructed = []
        for idx, image_array in enumerate(predictions):
            image= image_array.squeeze()
            img = Image.fromarray(np.uint8(image * 255))
            test_preds_reconstructed.append(img)
        j=0
        for i in range(0,len(test_preds_reconstructed),num_slices_x * num_slices_y):
           slices = test_preds_reconstructed[i:i + num_slices_x * num_slices_y] 
           reconstructed_image = reconstruct_image(slices, original_shape, num_slices_x, num_slices_y)
           img = Image.fromarray(np.uint8(reconstructed_image * 255)) 
           img_path = os.path.join(RESULT_FOLDER, f"result_{j}.png")
           j+=1
           img.save(img_path)
           # Check if the record already exists
           try:
            existing_result = db.session.query(ResultatFile).filter_by(
                filename=Path(img_path).name,
                filepath=img_path,
                project_id=project_id
            ).one()
            # Si un enregistrement est trouvé, il ne sera pas ajouté
            print("L'enregistrement existe déjà, pas besoin de l'ajouter.")
           except NoResultFound:
                # Si aucun enregistrement n'est trouvé, créez-en un nouveau
                resultat_file = ResultatFile(
                    filename=Path(img_path).name,
                    filepath=img_path,
                    project_id=project_id
                )
                db.session.add(resultat_file)
                db.session.commit()


    except Exception as e:
        print(f"Error during model prediction: {e}")
        return jsonify({"error": "Error during model prediction"}), 500

    return jsonify({'resultats': predictions.tolist()}), 200


@dl_routes.route('/results/<int:project_id>', methods=['GET'])
@jwt_required()
def get_imported_results(project_id):
    project = Project.query.get_or_404(project_id)
    if project.user_id != get_jwt_identity():
        return jsonify(message='Unauthorized access'), 401

    resulted_files = ResultatFile.query.filter_by(project_id=project_id).all()

    # Liste des URLs des fichiers importés
    image_urls = []

    for file in  resulted_files:
        # Génération de l'URL pour chaque fichier
        file_url = file.filepath
        image_urls.append({'url': file_url})
    
    logging.info(image_urls)
    return jsonify({'resultats':image_urls}
                   )
##########################################################################
def reconstruct_image(slices, original_shape, num_slices_x, num_slices_y):
    try:
        reconstructed_image = np.zeros(original_shape)
        slice_height = original_shape[0] // num_slices_y
        slice_width = original_shape[1] // num_slices_x
        idx = 0
        for i in range(num_slices_y):
            for j in range(num_slices_x):
                start_y = i * slice_height
                end_y = (i + 1) * slice_height
                start_x = j * slice_width
                end_x = (j + 1) * slice_width
                if idx < len(slices):
                    reconstructed_image[start_y:end_y, start_x:end_x] = slices[idx]
                    idx += 1
                else:
                    print(f"Warning: Index {idx} is out of range for slices.")
        return reconstructed_image
    except Exception as e:
        print(f"Error in reconstruct_image: {e}")
        raise
########################""
def check_if_results_exist(project_id):
    # Supposons que vous ayez une table `ModelResults` pour stocker les résultats
    results =  ResultatFile.query.filter_by(project_id=project_id).first()
    if results:
        return True
    else:
        return False
@dl_routes.route('/model-results/<project_id>', methods=['GET'])
def get_model_results(project_id):
    results_exist = check_if_results_exist(project_id)
    return jsonify({'resultsExist': results_exist})

####################################################
import datetime
@dl_routes.route('/save-data/<project_id>', methods=['POST'])
def saveHist(project_id):
    try:
        data = request.get_json()  # Cette ligne récupère les données envoyées dans le corps de la requête
        urls = data.get("urls")
        print("aaa",data.get("normalized"))
        print("bbb",data.get("sliced"))
        print("bbb",data.get("resized"))
        fileId=data.get("fileId")
        sliced=""
        normalized=""
        resized=""
        suffixes=[]
        if (fileId):
            print("fileid")
            processed_file = Historique.query.filter_by(id=fileId).first()  
            # Générer le nom basé sur la date et l'heure actuelles
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            name = f'data_{timestamp}'
            
            # Convertir la liste des URLs en une chaîne JSON
            urls_str = json.dumps(urls)
            
            # Initialisez d'abord les variables avec les valeurs appropriées
            if processed_file.sliced:            
                sliced = processed_file.sliced     
                print("sliced ",sliced )  
                suffixes.append('Sliced')
            
            if processed_file.normalised:  

                normalized = processed_file.normalised
                print("normalized ",normalized)  
                suffixes.append('Normalized')
                
        

            if processed_file.resized:
                resized = processed_file.resized
                suffixes.append('Resized')
                
                      
        # Générer le nom basé sur la date et l'heure actuelles
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        
            
         # Convertir la liste des URLs en une chaîne JSON
        urls_str = json.dumps(urls)
        if (data.get("normalized")) :  
            normalized = data.get("normalized")
            suffixes.append('Normalised')
            print("aaa")
        
        if(data.get("sliced")):
            sliced = data.get("sliced")
            suffixes.append('Sliced')
            print("bbb")
        if(data.get("resized")):    
            resized = data.get("resized")
            suffixes.append('Resized')
            print("ccc")

        suffix = '_'.join(suffixes)  # Combiner les suffixes avec "_"
        name = f'data_{timestamp}{("_" + suffix) if suffix else ""}'  

        # Ensuite, créez l'objet Historique
        his = Historique(
            url=urls_str,  # Utilisez la chaîne JSON pour stocker les URLs
            normalised=normalized,
            sliced=sliced,
            resized=resized,
            name=name,
            project_id=int(project_id)  # Convertir project_id en entier si nécessaire
        )
            
        # Ajoutez à la base de données
        db.session.add(his)
        db.session.commit()
            
        return jsonify({'message': 'Data saved successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
########################################################
@dl_routes.route('/history/<project_id>', methods=['GET'])
def getHistrique(project_id):
    logging.debug(f'Received data: {project_id}')
    try:
        mod_files = Historique.query.filter_by(project_id=project_id).all()
        return jsonify([{'id': mf.id, 'name': mf.name} for mf in mod_files]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@dl_routes.route('/fichier/<int:file_id>', methods=['GET'])
def get_file_data(file_id):
    current_app.logger.info(f"Received request for file ID: {file_id}")
    try:
        file = Historique.query.get(file_id)
        data=[]
        if file:
            current_app.logger.info(f"File found: {file.name}")
            # Assuming file is on disk and needs to be read as data
            data.append(file.normalised)
            data.append(file.sliced)
            data.append(file.resized)
            data.append(file.url)
            return jsonify({"data":data})
        else:
            current_app.logger.warning(f"File with ID {file_id} not found")
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        current_app.logger.error(f"Error retrieving file data: {str(e)}")
        return jsonify({"error": str(e)}), 400
    