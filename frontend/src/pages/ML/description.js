import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { faUser, faChartLine, faCog, faBrain, faDatabase,  faFileAlt,faHistory ,faRocket} from '@fortawesome/free-solid-svg-icons';
import { mean, std, min, max } from 'mathjs';
import '../../assets/css/Description.css'; // Assurez-vous d'avoir un fichier CSS pour le style

const Description = () => {
    const navigate = useNavigate();
    const { id ,targetFeature} = useParams();
    const [data, setData] = useState([]);
    const [description, setDescription] = useState({});

    const cleanData = (data) => {
        if (typeof data === 'string') {
            return data.replace(/NaN/g, 'null');
        }
        return data;
    };

    const getUniqueValuesCount = (values) => {
        return new Set(values).size;
    };

    const sanitizeJson = (jsonString) => {
        // Remplacer 'NaN' par 'null' ou une autre valeur valide
        return jsonString.replace(/NaN/g, 'null');
      };
      const importBD = async () => {
        const token = localStorage.getItem('token'); // Récupérez le token depuis localStorage
       
        try {
            const response = await axios.get(`http://localhost:5000/file/projects/${id}/imported-files`, {
                headers: {
                    'Authorization': `Bearer ${token}` // Ajoutez le token ici
                },
                withCredentials: true,
            });
      
            const data = response.data;
            console.log(data);
            console.log(typeof data);
      
            let cleanedData;
            let last_column_name;
      
            if (typeof data === 'object') {
                last_column_name = data.last_column_name;
                cleanedData = cleanData(data.data);
            } else if (typeof data === 'string') {
                try {
                    // Assainir les données avant le parsing
                    const sanitizedData = sanitizeJson(data);
                    const parsedData = JSON.parse(sanitizedData);
      
                    last_column_name = parsedData.last_column_name;
                    cleanedData = cleanData(parsedData.data);
                } catch (e) {
                    console.error('Erreur lors du parsing des données JSON :', e);
                    return;
                }
            } else {
                console.error('Format de réponse inattendu', data);
                return;
            }
      
            console.log(cleanedData);
    
          if (Array.isArray(cleanedData)) {
            setData(cleanedData);
            generateDescription(cleanedData);

          } else if (typeof cleanedData === 'string') {
            try {
              const parsedData = JSON.parse(cleanedData);
              setData(parsedData);
              generateDescription(parsedData);

            } catch (e) {
              console.error('Erreur lors du parsing des données JSON :', e);
            }
          } else {
            console.error('Format de réponse inattendu', cleanedData);
          }
        } catch (error) {
            alert( error)

          console.error('Erreur lors de la récupération des fichiers importés :', error);
        }
      };
    const generateDescription = (data) => {
        const columns = Object.keys(data[0] || {});
        const description = {};
        columns.forEach(column => {
            const values = data.map(row => row[column]);
            const nonNullValues = values.filter(value => value !== null && !isNaN(value));
            const nullCount = values.length - nonNullValues.length;
// Calculer le pourcentage de valeurs nulles
const nullCountpr = (values.length === 0 ? 0 : (nullCount / values.length) * 100);            description[column] = {
                mean: nonNullValues.length > 0 ? mean(nonNullValues) : 'N/A',
                stdDev: nonNullValues.length > 0 ? std(nonNullValues) : 'N/A',
                min: nonNullValues.length > 0 ? min(nonNullValues) : 'N/A',
                max: nonNullValues.length > 0 ? max(nonNullValues) : 'N/A',
                unique: getUniqueValuesCount(nonNullValues),
                count: values.length,
                nullCount, // Compte des valeurs nulles
                nullCountpr
            };
        });
        setDescription(description);
    };

    useEffect(() => {
        importBD();
    }, [id]);

    const handleProfileClick = () => navigate('/profile');
    const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
    const handleProcessingClick = () => navigate(`/processing/${id}/${targetFeature}`);
    const handleModelsClick = () => navigate(`/models/${id}/${targetFeature}`);
    const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

    const handleDBClick = () => navigate(`/importSucc/${id}`);
    const handleDescription = () => navigate(`/description/${id}/${targetFeature}`);
    const handleHistorique = () => {navigate(`/historique/${id}/${targetFeature}`)}

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

            <div className="content1">
                <h2>Data Description</h2>
                <p className="header-subtitle">Detailed Descriptions and Analysis for Better Understanding</p> 
                <div className="data-description">
                    <table className="description-table">
                        <thead>
                            <tr>
                                <th>Column</th>
                                <th>Mean</th>
                                <th>Standard Deviation</th>
                                <th>Min</th>
                                <th>Max</th>
                                <th>Unique Values</th>
                                <th>Total Count</th>
                                <th>Null Count</th> 
                                <th>Null Count(%)</th> 
                            </tr>
                        </thead>
                        <tbody>
    {Object.keys(description).map(column => {
        const isHighNullPercentage = description[column].nullCountpr > 20;
        return (
            <tr key={column} className={isHighNullPercentage ? 'high-null-percentage' : ''}>
                <td>{column}</td>
                <td>
                    {description[column].mean === 'N/A' ? 'N/A' : description[column].mean.toFixed(2)}
                </td>
                <td>
                    {description[column].stdDev === 'N/A' ? 'N/A' : description[column].stdDev.toFixed(2)}
                </td>
                <td>
                    {description[column].min === 'N/A' ? 'N/A' : description[column].min.toFixed(2)}
                </td>
                <td>
                    {description[column].max === 'N/A' ? 'N/A' : description[column].max.toFixed(2)}
                </td>
                <td>{description[column].unique}</td>
                <td>{description[column].count}</td>
                <td>{description[column].nullCount}</td> 
                <td>
                    {(description[column].nullCountpr || 0).toFixed(2)}
                </td>
            </tr>
        );
    })}
</tbody>

                    </table>
                </div>
            </div>
        </>
    );
};

export default Description;
