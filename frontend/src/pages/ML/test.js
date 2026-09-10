import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChartLine, faCog, faBrain, faDatabase,  faFileAlt,faBullseye,faHistory,faRocket} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../assets/css/test.css';


const Test = () => {
    const navigate = useNavigate();
    const { id, model } = useParams(); // Inclure model ici
    const [data, setData] = useState([]);
    const [targetFeature, setTargetFeature] = useState('');
    const [inputValues, setInputValues] = useState({});
    const [prediction, setPrediction] = useState(null);
    const lineStyle = {
        width: '100%',      // largeur de la ligne
        height: '1px',      // épaisseur de la ligne
        backgroundColor: '#a9aeb4', // couleur de la ligne
        margin: '5px 0'    // espacement autour de la ligne
    };
    const cleanData = (data) => {
        if (typeof data === 'string') {
            return data.replace(/NaN/g, 'null');
        }
        return data;
    };

    const sanitizeJson = (jsonString) => {
        return jsonString.replace(/NaN/g, 'null');
    };

    const importBD = async () => {
        const token = localStorage.getItem('token');

        try {
            const response = await axios.get(`http://localhost:5000/file/projects/${id}/imported-files`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true,
            });

            const data = response.data;
            let cleanedData;
            let last_column_name;

            if (typeof data === 'object') {
                last_column_name = data.last_column_name;
                cleanedData = cleanData(data.data);
            } else if (typeof data === 'string') {
                try {
                    const sanitizedData = sanitizeJson(data);
                    const parsedData = JSON.parse(sanitizedData);
                    last_column_name = parsedData.last_column_name;
                    cleanedData = cleanData(parsedData.data);
                } catch (e) {
                    console.error('Erreur lors du parsing des données JSON :', e);
                    return;
                }
            }

            if (Array.isArray(cleanedData)) {
                setData(cleanedData);
                setTargetFeature(last_column_name);

                const featureKeys = Object.keys(cleanedData[0]).filter(key => key !== last_column_name);
                const initialValues = featureKeys.reduce((acc, key) => {
                    acc[key] = '';
                    return acc;
                }, {});

                setInputValues(initialValues);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des fichiers importés :', error);
            alert( error)

        }
    };

    useEffect(() => {
        importBD();
    }, []); // Assurez-vous que les dépendances sont correctes

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputValues({
            ...inputValues,
            [name]: value,
        });
    };

    const handlePredict = async () => {
      if (!model) {
          console.error('Model parameter is missing.');
          return;
      }
  
      const token = localStorage.getItem('token');
  
      // Convertir inputValues en liste si nécessaire
      const formattedData = Array.isArray(inputValues) ? inputValues : [inputValues];
  
      try {
          const response = await axios.post(`http://localhost:5000/ml_routes/projects/${id}/predict`, {
              model: model,
              data: formattedData
          }, {
              headers: {
                  'Authorization': `Bearer ${token}`
              },
              withCredentials: true,
          });
  
          // Utiliser la clé correcte pour les prédictions
          setPrediction(response.data.predictions);
      } catch (error) {
          console.error('Erreur lors de la prédiction :', error);
          alert( error)

          // Optionnel: Afficher un message d'erreur à l'utilisateur
      }
  };
  const handleHistorique = () => navigate(`/historique/${id}/${targetFeature}`);
  const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);


    return (
        <>
            <div className="menu-bar">
                <div className="app-name2">
                    <img src="/lg.png" alt="App Icon" className="app-icon" />
                    <span>MedicalVision</span>
                </div>
                <div className="menu-item" onClick={() => navigate('/profile')}>
                    <FontAwesomeIcon icon={faUser} className="menu-icon" /> Profile
                </div>
                <div className="menu-item" onClick={() => navigate(`/importSucc/${id}`)}>
                    <FontAwesomeIcon icon={faDatabase} className="menu-icon" /> Database
                </div>
                <div className="menu-item" onClick={handleHistorique}>
                    <FontAwesomeIcon icon={faHistory} className="menu-icon" /> History
                </div>
                <div className="menu-item" onClick={() => navigate(`/description/${id}/${targetFeature}`)}>
                    <FontAwesomeIcon icon={faFileAlt} className="menu-icon" /> Description
                </div>
                <div className="menu-item" onClick={() => navigate(`/graphs/${id}/${targetFeature}`)}>
                    <FontAwesomeIcon icon={faChartLine} className="menu-icon" /> Graphs
                </div>
                <div className="menu-item" onClick={() => navigate(`/processing/${id}/${targetFeature}`)}>
                    <FontAwesomeIcon icon={faCog} className="menu-icon" /> Processing
                </div>
                <div className="menu-item" onClick={() => navigate(`/models/${id}/${targetFeature}`)}>
                    <FontAwesomeIcon icon={faBrain} className="menu-icon" /> Models
                </div>
                <div className="menu-item" onClick={handleDepClick}>
                    <FontAwesomeIcon icon={faRocket} className="menu-icon" /> Deployment
                </div>
            </div>
            <div className="content2">
                <h1>Test Model</h1>
                <div style={lineStyle}></div>
                <p className="header-subtitle">Test your model to see how well it performs with new inputs.</p> 

                <div className="container1">
                <div className="target-feature-container">
           <h2>Target Feature:</h2>
          <p>{targetFeature}</p>
        </div><br></br>

                {Object.keys(inputValues).length > 0 ? (
                    <form>
                        {Object.keys(inputValues).map((key, index) => (
                            <div key={index} className="form-group">
                                <input
                                    type="text"
                                    id={key}
                                    name={key}
                                    placeholder={key}
                                    value={inputValues[key] || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                        ))}

                        <button type="button" onClick={handlePredict} className='bb'><FontAwesomeIcon icon={faBullseye} className="menu-icon" />Predict</button>
                    </form>
                ) : (
                    <p>Loading features...</p>
                )}

                {prediction && (
                    <div className="prediction-result">
                        <h3>{targetFeature }: {prediction}</h3>
                    </div>
                )}
            </div></div>
        </>
    );
};

export default Test;
