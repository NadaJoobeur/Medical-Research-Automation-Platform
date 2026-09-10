import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChartLine, faCog, faBrain, faDatabase,faPlay, faFileAlt,faHistory ,faRocket} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../assets/css/models.css';
import { useLocation } from 'react-router-dom';


const Models = () => {
  const navigate = useNavigate();
  const { id,targetFeature,fileData } = useParams();
  const [data, setData] = useState([]);
  const [taskType, setTaskType] = useState('');
  const [trainingSetSize, setTrainingSetSize] = useState(70);
  const [validationSetSize, setValidationSetSize] = useState(30);
  const [testSetSize, setTestSetSize] = useState(0);
  const [error, setError] = useState(null);
  const location = useLocation(); // Pour accéder à l'URL et ses paramètres
  const [crossValidationType, setCrossValidationType] = useState('division'); // État pour les boutons radio
  const [kSets, setKSets] = useState(5);
  const[models,setModels]=useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Gérer l'état du dropdown
  const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);

  const classificationModels = [
    'Random Forest',
    'Gradient Boosting',
    'Logistic Regression',
    'LightGBM',
    'XGBoost',
    'Decision Tree',
    'Support Vector Machine',
    'KNN',
    'Extra Random Trees',
    'Single Layer Perceptron'
  ];

  const regressionModels = [
    'Random Forest',
    'Gradient Boosting',
    'LightGBM',
    'XGBoost',
    'Decision Tree',
    'Support Vector Machine',
    'Stochastic Gradient Descent',
    'KNN',
    'Extra Random Trees',
    'Single Layer Perceptron',
    'Lasso Path'
  ];

  const metrics = [
    'Accuracy',
    'Precision',
    'Recall',
    'F1 Score',
    'ROC AUC',
    'Mean Absolute Error',
    'Mean Squared Error',
    'R² Score'
  ];

  // Métriques pour Classification
const classificationMetrics = metrics.filter(metric =>
  ['Accuracy', 'Precision', 'Recall', 'F1 Score', 'ROC AUC'].includes(metric)
);

// Métriques pour Régression
const regressionMetrics = metrics.filter(metric =>
  ['Mean Absolute Error', 'Mean Squared Error', 'R² Score'].includes(metric)
);

  useEffect(() => {
  // Extraire le paramètre 'filtdate' de l'URL
  const urlParams = new URLSearchParams(location.search);
  const encodedFiltdate = urlParams.get('filtdate');

  if (encodedFiltdate) {
    try {
      // Décoder et parser les données JSON
      const decodedFiltdate = JSON.parse(decodeURIComponent(encodedFiltdate));

      // Mettre à jour l'état avec les données décodées
      setData(decodedFiltdate);

      // Afficher les données décodées dans la console
      console.log(decodedFiltdate);
    } catch (error) {
      console.error("Erreur lors du décodage des données:", error);
    }
  }
  console.log("models :",models)
  console.log("metrics:",selectedMetrics)

  // Vérification du fichier de données
  if (!fileData) {
    alert("Importez vos données depuis l'historique ou traitez d'abord vos données !");
  }
}, [location.search, fileData,selectedMetrics,models]); // Réexécuter l'effet lorsque l'URL ou fileData change


  const handleProfileClick = () => navigate('/profile');
  const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
  const handleProcessingClick = () => navigate(`/processing/${id}/${targetFeature}`);
  const handleModelsClick = () => navigate(`/models/${id}/${targetFeature}`);
  const handleDBClick = () => navigate(`/importSucc/${id}`);
  const handleDescription = () => navigate(`/description/${id}/${targetFeature}`);
  /*const handleTest = () => navigate(`/test/${id}/${selectedModel}`);*/
  const handleHistorique=()=>{navigate(`/historique/${id}/${targetFeature}`)}
  // Gestion de la sélection des modèles
  const handleModelSelection = (model) => {
    if (models.includes(model)) {
      // Supprime le modèle si déjà sélectionné
      setModels(models.filter(m => m !== model));
    } else {
      // Ajoute le modèle si non sélectionné
      setModels([...models, model]);
    }
  };

  const handleMetricSelection = (metric) => {
    setSelectedMetrics(prevMetrics => {
      if (prevMetrics.includes(metric)) {
        // Désélectionner la métrique
        return prevMetrics.filter(m => m !== metric);
      } else {
        // Sélectionner la métrique
        return [...prevMetrics, metric];
      }
    });
  };
  const handleK = (e) => {
    // Extraire la nouvelle valeur de l'input
    const newKSets = parseInt(e.target.value, 10);

    // Mettre à jour l'état avec la nouvelle valeur
    if (!isNaN(newKSets) && newKSets > 0) { // Validation basique
      setKSets(newKSets);
    }
  };

  const handleSubmit = async () => {
   
    try {
     const response = await axios.post(`http://localhost:5000/ml_routes/train/${id}`, {
        model: models,
        targ:targetFeature,
        trainset:trainingSetSize,
        testset:testSetSize,
        valtest:validationSetSize,
        metrics:selectedMetrics,
        data,
        k:kSets,
        task:taskType
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });
      console.log("aaaaa",response.data)
      // Stocker le résultat dans localStorage
    localStorage.setItem('modelResult', JSON.stringify(response.data));
    setError(null);

    // Rediriger vers la page des résultats
    navigate(`/resultat/${id}`);
      
    } catch (error) {
      alert('Error during model training:',error)
      console.error('Error during model training:', error);
    }
  };

  const getRemainingSize = (currentSetSize) => Math.max(0, 100 - currentSetSize);

  // Fonction pour gérer le changement de la taille du training set
  const handleTrainingSetSizeChange = (e) => {
    const newTrainingSetSize = Math.min(parseInt(e.target.value, 10), getRemainingSize(validationSetSize + testSetSize));
    setTrainingSetSize(newTrainingSetSize);
    setValidationSetSize(Math.min(validationSetSize, 100 - newTrainingSetSize - testSetSize));
  };

  // Fonction pour gérer le changement de la taille du validation set
  const handleValidationSetSizeChange = (e) => {
    const newValidationSetSize = Math.min(parseInt(e.target.value, 10), getRemainingSize(trainingSetSize + testSetSize));
    setValidationSetSize(newValidationSetSize);
    setTestSetSize(Math.min(testSetSize, 100 - trainingSetSize - newValidationSetSize));
  };

  // Fonction pour gérer le changement de la taille du test set
  const handleTestSetSizeChange = (e) => {
    const newTestSetSize = Math.min(parseInt(e.target.value, 10), getRemainingSize(trainingSetSize + validationSetSize));
    setTestSetSize(newTestSetSize);
    setValidationSetSize(Math.min(validationSetSize, 100 - trainingSetSize - newTestSetSize));
  };


  const availableModels = taskType === 'classification' ? classificationModels : (taskType === 'regression' ? regressionModels : []);
  const availableMetrics = taskType === 'classification' ? classificationMetrics : (taskType === 'regression' ? regressionMetrics : []);

  const lineStyle = {
    width: '100%',      // largeur de la ligne
    height: '1px',      // épaisseur de la ligne
    backgroundColor: '#a9aeb4', // couleur de la ligne
    margin: '5px 0'    // espacement autour de la ligne
};
const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

  return (
    <>
      <div className="menu-bar">
        <div className="app-name2">
          <img src="/lg.png" alt="App Icon" className="app-icon" />
          <span>MedicalVision</span>
        </div>
        <div className="menu-item" onClick={handleProfileClick}>
          <FontAwesomeIcon icon={faUser} className="menu-icon" /> Profile
        </div>
        <div className="menu-item" onClick={handleDBClick}>
          <FontAwesomeIcon icon={faDatabase} className="menu-icon" /> Database
        </div>
        <div className="menu-item" onClick={handleHistorique}>
                     <FontAwesomeIcon icon={faHistory} className="menu-icon" /> History
                </div>
        <div className="menu-item" onClick={handleDescription}>
          <FontAwesomeIcon icon={faFileAlt} className="menu-icon" /> Description
        </div>
        <div className="menu-item" onClick={handleGraphsClick}>
          <FontAwesomeIcon icon={faChartLine} className="menu-icon" /> Graphs
        </div>
        <div className="menu-item" onClick={handleProcessingClick}>
          <FontAwesomeIcon icon={faCog} className="menu-icon" /> Processing
        </div>
        <div className="menu-item" onClick={handleModelsClick}>
          <FontAwesomeIcon icon={faBrain} className="menu-icon" /> Models
        </div>
        <div className="menu-item" onClick={handleDepClick}>
          <FontAwesomeIcon icon={faRocket} className="menu-icon" /> Deployment
        </div>
        
     
      </div>
      <div className="content2">
  <h1>Model Training</h1> 

  <div style={lineStyle}></div>
  <p className="header-subtitle">Start the training process with your configured data and options</p> 

  <div className="section target-feature">
    <h2>Target Feature</h2>
    <p>{targetFeature}</p>
 
    <h2> Task Type</h2>
    <div className="task-selection">
      <select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
        <option value="" disabled>Select a task type</option>
        <option value="classification">Classification</option>
        <option value="regression">Regression</option>
      </select>
    </div>
  </div>

  {taskType && (
    <div className="section model-training">
      <h2>Model and Training Parameters</h2>
      <div className="model-selection">
      <button onClick={() => {
        setIsDropdownOpen(!isDropdownOpen);
        console.log("Dropdown state:", isDropdownOpen); // Vérifier l'état lors du clic
      }}>
        Select Models
      </button>

      {isDropdownOpen && (
        <div className='dropdown2'>
          {availableModels.map(model => (
            <label key={model} style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={models.includes(model)}
                onChange={() => handleModelSelection(model)}
              />
              {model}
            </label>
          ))}
        </div>
      )}
      </div>
      <div>
      <label>Cross-Validation Type:</label>
      <div className="radio-buttons">
        <label>
          <input
            type="radio"
            value="division"
            checked={crossValidationType === 'division'}
            onChange={() => setCrossValidationType('division')}
          />
          Division
        </label>
        <label>
          <input
            type="radio"
            value="kfold"
            checked={crossValidationType === 'kfold'}
            onChange={() => setCrossValidationType('kfold')}
          />
          K-Fold
        </label>
      </div>

      {/* Si le type de validation est K-fold, afficher les paramètres K sets */}
      {crossValidationType === 'kfold' && (
        <div className="k-sets-container">
          <label htmlFor="k-sets">K sets:</label>
          <input
            id="k-sets"
            type="number"
            min="1" // Éviter les valeurs négatives ou nulles
            value={kSets}
            onChange={handleK}
          />
        </div>
      )}

      {/* Si le type de validation est division, afficher les paramètres de taille des ensembles */}
      {crossValidationType === 'division' && (
        <div className="training-parameters">
          <label>Training Set Size:</label>
          <input
            type="number"
            min="0"
            value={trainingSetSize}
            onChange={handleTrainingSetSizeChange}
          />
          <label>Validation Set Size:</label>
          <input
            type="number"
            min="0"
            value={validationSetSize}
            onChange={handleValidationSetSizeChange}
          />
          <label>Test Set Size:</label>
          <input
            type="number"
            min="0"
            value={testSetSize}
            onChange={handleTestSetSizeChange}
          />
        </div>
      )}
    </div>
    <div className="metric-selection">
      <button className='met' onClick={() => setIsDropdownOpen1(!isDropdownOpen1)}>
        Select Metrics
      </button>
      
      {isDropdownOpen1 && (
        <div className="dropdown2">
          {availableMetrics.map(metricOption => (
            <label key={metricOption} style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={selectedMetrics.includes(metricOption)}
                onChange={() => handleMetricSelection(metricOption)}
              />
              {metricOption}
            </label>
          ))}
        </div>
      )}
    </div>
    
      <div className='btn1'>
        <button onClick={handleSubmit} className='bb'>
  <FontAwesomeIcon icon={faPlay} className="button-icon" /> Train Model
</button>        </div>
    </div>
  )}
 
</div>

      
    </>
  );
};

export default Models;
