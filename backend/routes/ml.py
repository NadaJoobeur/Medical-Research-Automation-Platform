from flask import Blueprint, request, jsonify
import os
import pandas as pd
import logging
from sklearn.model_selection import train_test_split, KFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, mean_absolute_error, mean_squared_error, r2_score
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    ExtraTreesClassifier,
)
from sklearn.linear_model import LogisticRegression, SGDRegressor, Lasso
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
import lightgbm as lgb
import xgboost as xgb
from sklearn.neural_network import MLPRegressor
from sklearn.ensemble import ExtraTreesRegressor, GradientBoostingRegressor, RandomForestRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.svm import SVR
from sklearn.tree import DecisionTreeRegressor
import joblib
import datetime
import numpy as np
from flask import jsonify, request
from app.models import *


ml_routes = Blueprint('ml_routes', __name__)

#from run import app 

@ml_routes.route('/train/<int:project_id>', methods=['POST'])
def train_model(project_id):
    try:
        data = request.json.get('data')
        models = request.json.get('model')
        target_feature = request.json.get('targ')
        train_set_size = request.json.get('trainset')
        test_set_size = request.json.get('valtest')
        val_test_size = request.json.get('testset')
        selected_metrics = request.json.get('metrics')
        k_folds = request.json.get('k')
        task = request.json.get('task')

        is_classification = task == 'classification'
        print("train_set_size:",train_set_size)
        print("test_set_size:",test_set_size)
        print("val_test_size:",val_test_size)
        # Convertir les données en DataFrame
        df = pd.DataFrame(data)
        X = df.drop(columns=[target_feature])
        y = df[target_feature]

        # Vérification des valeurs uniques dans y
        print("Valeurs uniques de y :", y.unique())
        if is_classification:
            y = (y > 0.5).astype(int)

        results = {}

        if k_folds > 1:
            kf = KFold(n_splits=k_folds)
        else:
            if val_test_size > 0:
                X_train, X_temp, y_train, y_temp = train_test_split(X, y, test_size=val_test_size / 100.0, random_state=42)
                
                X_val, X_test, y_val, y_test = train_test_split(X_temp, y_temp, test_size=test_set_size, random_state=42)
                results['Train Size'] = len(X_train)
                results['Validation Size'] = len(X_val)
                results['Test Size'] = len(X_test)
            else:
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_set_size / 100.0, random_state=42)
                results['Train Size'] = len(X_train)
                results['Test Size'] = len(X_test)

        for model_name in models:
            model = get_model(model_name, is_classification)
            model_results = {}
            if k_folds > 1:
                fold_metrics = []
                for train_index, test_index in kf.split(X):
                    X_train, X_test = X.iloc[train_index], X.iloc[test_index]
                    y_train, y_test = y.iloc[train_index], y.iloc[test_index]

                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_test)

                    # Vérifiez que y_pred est binaire
                    if is_classification:
                        y_pred = (y_pred > 0.5).astype(int)
                    
                    # Vérifiez les valeurs après conversion
                    print("Valeurs uniques de y_pred :", np.unique(y_pred))

                    metrics = calculate_metrics(y_test, y_pred, selected_metrics, task)
                    fold_metrics.append(metrics)

                avg_metrics = {metric: float(np.mean([fold[metric] for fold in fold_metrics])) for metric in selected_metrics}
                model_results['Metrics'] = avg_metrics
            else:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)

                if is_classification:
                    y_pred = (y_pred > 0.5).astype(int)

                # Vérifiez les valeurs après conversion
                print("Valeurs uniques de y_pred :", np.unique(y_pred))

                metrics = calculate_metrics(y_test, y_pred, selected_metrics, task)
                model_results['Metrics'] = metrics

                if val_test_size > 0:
                    y_val_pred = model.predict(X_val)
                    if is_classification:
                        y_val_pred = (y_val_pred > 0.5).astype(int)
                    val_metrics = calculate_metrics(y_val, y_val_pred, selected_metrics, task)
                    model_results['Validation Metrics'] = val_metrics

            # Importances des caractéristiques
            if hasattr(model, 'feature_importances_'):
                importances = model.feature_importances_
                importance_dict = {feature: float(importance) for feature, importance in zip(X.columns, importances)}
                model_results['Feature Importances'] = importance_dict

            # Convertir les résultats en format sérialisable
            model_results = {k: (float(v) if isinstance(v, (np.float64, np.int32)) else v) for k, v in model_results.items()}
            
            results[model_name] = model_results

            # Sauvegarder le modèle
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            model_save_path = f'models/{model_name}_{timestamp}.pkl'
            os.makedirs('models', exist_ok=True)
            joblib.dump(model, model_save_path)
            logging.info(f'Model saved at {model_save_path}')
            
            # Enregistrer les résultats dans la base de données
            new_model_entry = Models(
                modelname=f"{model_name}_{timestamp}",
                modelpath=model_save_path,
                validpath="N/A",
                Accuracy=model_results['Metrics'].get('Accuracy', 0.0),
                Precisionn=model_results['Metrics'].get('Precision', 0.0),
                Recall=model_results['Metrics'].get('Recall', 0.0),
                F1_Score=model_results['Metrics'].get('F1 Score', 0.0),
                ROC_AUC=model_results['Metrics'].get('ROC AUC', 0.0),
                MeanAbsoluteError=model_results['Metrics'].get('Mean Absolute Error', 0.0),
                MeanSquaredError=model_results['Metrics'].get('Mean Squared Error', 0.0),
                RScore=model_results['Metrics'].get('R² Score', 0.0),
                featureimportance=str(importance_dict) if 'Feature Importances' in model_results else "N/A",
                project_id=project_id,
                trainingset=train_set_size,
                testset=val_test_size,
                k=k_folds
            )
            db.session.add(new_model_entry)
            db.session.commit()

        logging.info('Returning successful response')
        return jsonify(results)

    except Exception as e:
        logging.error(f'Error during training: {str(e)}')
        return jsonify({'Error during training': str(e)}), 500




def get_model(model_name,is_classification):
    if is_classification:
        if model_name == 'Random Forest':
            return RandomForestClassifier()
        elif model_name == 'Gradient Boosting':
            return GradientBoostingClassifier()
        elif model_name == 'Logistic Regression':
            return LogisticRegression()
        elif model_name == 'LightGBM':
            return lgb.LGBMClassifier()
        elif model_name == 'XGBoost':
            return xgb.XGBClassifier()
        elif model_name == 'Decision Tree':
            return DecisionTreeClassifier()
        elif model_name == 'Support Vector Machine':
            return SVC(probability=True)
        elif model_name == 'KNN':
            return KNeighborsClassifier()
        elif model_name == 'Extra Random Trees':
            return ExtraTreesClassifier()
        elif model_name == 'Single Layer Perceptron':
            return MLPClassifier()
    else:
        if model_name == 'Random Forest':
            return RandomForestRegressor()
        elif model_name == 'Gradient Boosting':
            return GradientBoostingRegressor()
        elif model_name == 'LightGBM':
            return lgb.LGBMRegressor()
        elif model_name == 'XGBoost':
            return xgb.XGBRegressor()
        elif model_name == 'Decision Tree':
            return DecisionTreeRegressor()
        elif model_name == 'Support Vector Machine':
            return SVR()
        elif model_name == 'KNN':
            return KNeighborsRegressor()
        elif model_name == 'Extra Random Trees':
            return ExtraTreesRegressor()
        elif model_name == 'Single Layer Perceptron':
            return MLPRegressor()
        elif model_name == 'Stochastic Gradient Descent':
            return SGDRegressor()
        elif model_name == 'Lasso Path':
            return Lasso()
        else:
            raise ValueError(f"Model '{model_name}' is not recognized")

def calculate_metrics(y_true, y_pred, metrics, task):
    metrics_results = {}
    if task.lower() == 'classification':  # Assurez-vous que le casing est correct
        if 'Accuracy' in metrics:
            metrics_results['Accuracy'] = accuracy_score(y_true, y_pred)
        if 'Precision' in metrics:
            metrics_results['Precision'] = precision_score(y_true, y_pred, average='weighted')
        if 'Recall' in metrics:
            metrics_results['Recall'] = recall_score(y_true, y_pred, average='weighted')
        if 'F1 Score' in metrics:
            metrics_results['F1 Score'] = f1_score(y_true, y_pred, average='weighted')
        if 'ROC AUC' in metrics:
            metrics_results['ROC AUC'] = roc_auc_score(y_true, y_pred)
    elif task.lower() == 'regression':
        if 'Mean Absolute Error' in metrics:
            metrics_results['Mean Absolute Error'] = mean_absolute_error(y_true, y_pred)
        if 'Mean Squared Error' in metrics:
            metrics_results['Mean Squared Error'] = mean_squared_error(y_true, y_pred)
        if 'R² Score' in metrics:
            metrics_results['R² Score'] = r2_score(y_true, y_pred)
    return metrics_results

    
@ml_routes.route("/projects/<int:project_id>/predict", methods=["POST"])
def predict(project_id):
    try:
        # Obtenez les données envoyées par le frontend
        data = request.json
        logging.debug(f'Received data: {data}')

        # Vérifiez si 'model' est fourni dans les données
        if 'model' not in data:
            logging.error('Model name not provided')
            return jsonify({'status': 'error', 'message': 'Model name not provided'}), 400

        model_name = data['model']
        logging.info(f'Model selected for prediction: {model_name}')

        # Charger le modèle sauvegardé
        model_path = f'models/{model_name}.pkl'
        if not os.path.exists(model_path):
            logging.error(f'Model file not found at {model_path}')
            return jsonify({'status': 'error', 'message': 'Model not found'}), 404

        try:
            model = joblib.load(model_path)
        except Exception as e:
            logging.error(f'Error loading model from {model_path}: {str(e)}')
            return jsonify({'status': 'error', 'message': 'Failed to load model'}), 500

        logging.info(f'Model {model_name} loaded from {model_path}')

        # Vérifiez si les données de prédiction sont présentes
        if 'data' not in data or not isinstance(data['data'], list):
            logging.error('Prediction data not provided or invalid format')
            return jsonify({'status': 'error', 'message': 'Invalid data for prediction'}), 400

        # Assurez-vous que les données sont sous forme de DataFrame
        try:
            new_data = pd.DataFrame(data['data'])
        except Exception as e:
            logging.error(f'Error converting data to DataFrame: {str(e)}')
            return jsonify({'status': 'error', 'message': 'Data conversion failed'}), 400

        if new_data.empty:
            logging.error('Received empty data for prediction')
            return jsonify({'status': 'error', 'message': 'No data for prediction'}), 400

        logging.info(f'New data for prediction received with shape: {new_data.shape}')
        logging.debug(f'New data head:\n{new_data.head()}')

        # Effectuer la prédiction
        try:
            y_pred = model.predict(new_data)
        except Exception as e:
            logging.error(f'Error during prediction: {str(e)}')
            return jsonify({'status': 'error', 'message': 'Prediction failed'}), 500

        logging.info('Prediction completed')

        # Retourner les résultats au frontend
        result = {
            'status': 'success',
            'predictions': y_pred.tolist()  # Convertir les résultats en une liste pour JSON
        }

        logging.info('Returning prediction results')
        return jsonify(result)

    except Exception as e:
        logging.error(f'Error during prediction: {str(e)}')
        return jsonify({'status': 'error', 'message': 'Error during prediction'}), 500

@ml_routes.route('/projects/<int:project_id>/set-target', methods=['POST'])
def set_target_feature(project_id):
    targ = request.json['targetFeature']
    logging.info(f"aaaaaa{targ}")

    logging.info(f'{targ}')  # Use logger instead of login
    target_feature = TargetFeature(name=targ, project_id=project_id)
    db.session.add(target_feature)
    db.session.commit()
    return jsonify({'message': 'Target feature set successfully', 'project_id': project_id}), 201
@ml_routes.route('/projects/<int:project_id>/target-feature', methods=['GET'])
def get_target_feature(project_id):
    # Order by a specific column and get the first result
    targ = TargetFeature.query.filter_by(project_id=project_id).order_by(TargetFeature.id.desc()).first()
    
    if not targ:
        logging.warning(f"No target feature found for project {project_id}")
        return jsonify(targetFeature=None), 404
    
    return jsonify(targetFeature=targ.name)



def save_to_csv(data, filepath):
    try:
        df = pd.DataFrame(data)
        
        # Assurez-vous que les colonnes sont correctement encodées en UTF-8
        for col in df.columns:
            df[col] = df[col].apply(lambda x: x.encode('latin1').decode('utf-8') if isinstance(x, str) else x)
        
        df.to_csv(filepath, index=False, encoding='utf-8-sig')  # Sauvegarde avec encodage UTF-8 avec BOM
    except Exception as e:
        print(f"Erreur lors de la sauvegarde du fichier CSV: {e}")

def save_file(data, filename):
    if not os.path.exists(mod_FOLDER):
        os.makedirs(mod_FOLDER)
    
    filepath = os.path.join(mod_FOLDER, filename)
    
    # Sauvegarde des données en CSV
    save_to_csv(data, filepath)
    
    return filepath  

def generate_timestamped_filename(extension='csv'):
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    return f'data_{timestamp}.{extension}'

@ml_routes.route('/save-data/<int:project_id>', methods=['POST'])
def saveMod(project_id):
    data = request.get_json()
   #logging.info(f'aaa{file_id}')  # Use logger instead of login*/
    logging.info(f'données: { data }')
    # Vérifiez le type de données
    logging.info(f'Type de données: {type(data)}')
    
    if not data:
        return jsonify({"error": "Aucune donnée reçue"}), 400
    
    # Vérifiez si les données sont sous forme de liste de dictionnaires
    if not isinstance(data, list):
        data = [data]  # Convertir en liste si ce n'est pas déjà une liste

    # Générer le nom du fichier et le chemin
    filename = generate_timestamped_filename()
    filepath = save_file(data, filename)
    
    # Sauvegarder les informations du fichier dans la base de données
    new_file = ModifiedFile(filename=filename, filepath=filepath, project_id=project_id)
    db.session.add(new_file)
    db.session.commit()
    
    return jsonify({"message": "Données sauvegardées avec succès", "filepath": filepath}), 200

@ml_routes.route('/historique/<int:project_id>', methods=['GET'])
def historique(project_id):
    logging.debug(f'Received data: {project_id}')
    try:
        mod_files = ModifiedFile.query.filter_by(project_id=project_id).all()
        return jsonify([{'id': mf.id, 'name': mf.filename} for mf in mod_files]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@ml_routes.route('/fichier/<int:file_id>', methods=['GET'])
def get_file_data(file_id):
    app.logger.info(f"Received request for file ID: {file_id}")
    try:
        file = ModifiedFile.query.get(file_id)
        if file:
            app.logger.info(f"File found: {file.filename}")
            # Read the file content with UTF-8 encoding
            with open(file.filepath, 'r', encoding='utf-8') as f:
                file_data = f.read()
            return jsonify({"data": file_data})
        else:
            app.logger.warning(f"File with ID {file_id} not found")
            return jsonify({"error": "File not found"}), 404
    except Exception as e:
        app.logger.error(f"Error retrieving file data: {str(e)}")
        return jsonify({"error": str(e)}), 400

@ml_routes.route('/models/<int:project_id>', methods=['GET'])
def models(project_id):
    logging.debug(f'Received data: {project_id}')
    try:
        mods = Models.query.filter_by(project_id=project_id).all()
        return jsonify([{'id': mf.id, 'name': mf.modelname} for mf in mods]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@ml_routes.route('/model/<int:file_id>', methods=['GET'])
def model(file_id):
    logging.debug(f'Received data: {file_id}')
    try:
        # Requête pour obtenir le modèle avec l'id spécifié
        mf = Models.query.filter_by(id=file_id).first()
        
        # Si le modèle n'est pas trouvé
        if mf is None:
            return jsonify({'error': 'Model not found'}), 404

        # Créer la réponse avec les données du modèle
        return jsonify({
            'name': mf.modelname,
            'Accuracy': mf.Accuracy,
            'Precisionn': mf.Precisionn,
            'Recall': mf.Recall,
            'F1_Score': mf.F1_Score,
            'ROC_AUC': mf.ROC_AUC,
            'MeanAbsoluteError': mf.MeanAbsoluteError,
            'MeanSquaredError': mf.MeanSquaredError,
            'RScore': mf.RScore,
            'featureimportance': mf.featureimportance,
            'trainingset':mf.trainingset,
            'testset':mf.testset,
            'k':mf.k
        }), 200

    except Exception as e:
        logging.error(f"Error retrieving model: {str(e)}")
        return jsonify({'error': str(e)}), 500