# 🧠 MedVision - Medical Research Automation Platform

[![Demo Video](https://img.shields.io/badge/📺-Demo_Video-red)](https://drive.google.com/file/d/1z5cbp8tV79wsfxuc33Z6Ud1js6intV-O/view?usp=drive_link)

**Web-based platform for end-to-end medical data processing**  
*Supports tabular data & medical images with experiment tracking*

---

## 🌟 Features
| Category              | Capabilities                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| **Data Import**       | CSV/Excel/DICOM                                                    |
| **Visualization**     | 3D slicers, histograms, layer fusion                                      |
| **Preprocessing**     | Auto-normalization, skull-stripping, patch extraction                     |
| **Model Training**    | U-Net, Inception hybrids, AutoML configs                                  |
| **Evaluation**        | Dice score, ROC curves, confusion matrices                               |
| **Collaboration**     | Exportable reports, version comparisons                                   |

---

## 🎥 Interactive Demo
[![MedVision Demo](https://img.shields.io/badge/▶️-Watch_Full_Demo-red)](https://drive.google.com/file/d/1z5cbp8tV79wsfxuc33Z6Ud1js6intV-O/view?usp=drive_link)
*(Click to see live preprocessing + tabular data treatment demo)*

---

---

## 📊 Tech Stack
| Component       | Technology Stack                                                                 |
|----------------|---------------------------------------------------------------------------------|
| **Frontend**   | React + Redux, Three.js (3D), Plotly.js                                         |
| **Backend**    | Flask, Celery (async tasks), OpenCV/PyDICOM                                     |
| **AI Models**  | TensorFlow/Keras (3D U-Net), Scikit-learn (tabular)                            |
| **Database**   | MySQL (relational), MinIO (DICOM storage)                                      |


---

## 🚀 Prérequis et démarrage

### Prérequis
- Python 3.9+ et `pip`
- Node.js 18+ et `npm`
- Un serveur MySQL, avec une base de données créée (ex. `prj`)

### 1. Backend (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt  # à créer si absent
```

Dans `config.py`, adapter (idéalement via des variables d'environnement) :
```python
SQLALCHEMY_DATABASE_URI = 'mysql://<user>:<password>@localhost/<db_name>'
SECRET_KEY = '<votre secret>'
```

Puis lancer le serveur :
```bash
python run.py
```
L'API tourne sur `http://localhost:5000` et crée les tables au premier lancement (`db.create_all()`).

> ⚠️ `config.py` contient actuellement des identifiants MySQL en clair (root sans mot de passe) et une `SECRET_KEY` placeholder — à sécuriser avant tout déploiement réel.

### 2. Frontend (React)
```bash
cd frontend
npm install
npm start
```
L'application tourne sur `http://localhost:3000` et communique avec le backend sur `http://localhost:5000` (URL actuellement codée en dur dans les composants).
