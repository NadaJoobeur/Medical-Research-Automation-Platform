import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChartLine, faCog, faBrain, faDatabase, faCheckCircle, faFileAlt,faHistory,faRocket } from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/importSucc.css';
import axios from 'axios';

const ImportSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [totalColumns, setTotalColumns] = useState(0);
  const [columnTypes, setColumnTypes] = useState({});
  const [targetFeature, setTargetFeature] = useState('');
  const [isTargetFeatureSet, setIsTargetFeatureSet] = useState(false);

  const cleanData = (data) => {
    if (typeof data === 'string') {
      return data.replace(/NaN/g, 'null');
    }
    return data;
  };

  const sanitizeJson = (jsonString) => {
    return jsonString.replace(/NaN/g, 'null');
  };

  // Fonction pour récupérer le target feature existant
  const fetchTargetFeature = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const targetResponse = await axios.get(`http://localhost:5000/ml_routes/projects/${id}/target-feature`, {
        headers: { 'Authorization': `Bearer ${token}` },
        withCredentials: true,
      });
      console.log(targetResponse.data.targetFeature)
      if (targetResponse.data.targetFeature) {
        setTargetFeature(targetResponse.data.targetFeature);
        setIsTargetFeatureSet(true);
      } else {
        setIsTargetFeatureSet(false);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du target feature :', error);
      alert( error)

    }
  };
  
  // Fonction pour importer la base de données
  const importBD = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(`http://localhost:5000/file/projects/${id}/imported-files`, {
        headers: { 'Authorization': `Bearer ${token}` },
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

          cleanedData = cleanData(parsedData.data);
        } catch (e) {
          console.error('Erreur lors du parsing des données JSON :', e);
          return;
        }
      } else {
        console.error('Format de réponse inattendu', data);
        return;
      }

      if (Array.isArray(cleanedData)) {
        setData(cleanedData);
        setTotalRows(cleanedData.length);
        setTotalColumns(cleanedData.length > 0 ? Object.keys(cleanedData[0]).length : 0);

        const types = Object.keys(cleanedData[0]).reduce((acc, key) => {
          acc[key] = typeof cleanedData[0][key];
          return acc;
        }, {});
        setColumnTypes(types);
      } else {
        console.error('Les données nettoyées ne sont pas un tableau.', cleanedData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des fichiers importés :', error);
      alert( error)

    }
  };

  useEffect(() => {
    importBD();
    fetchTargetFeature(); // Récupérer le target feature existant lors du montage
  }, [id]);

  // Fonction pour enregistrer le `targetFeature` sélectionné
  const saveTargetFeature = async () => {
    const token = localStorage.getItem('token');
    console.log("aaa",targetFeature )
    try {
      await axios.post(
        `http://localhost:5000//ml_routes/projects/${id}/set-target`,
        { targetFeature },
        {
          headers: { 'Authorization': `Bearer ${token}` },
          withCredentials: true,
        }
      );
      alert('Target feature saved successfully!');
      setIsTargetFeatureSet(true); // Désactiver la sélection après l'enregistrement
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du target feature :', error);
      alert('Failed to save target feature.');
      alert( error)

    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleGraphsClick = () => {
    navigate(`/graphs/${id}/${targetFeature}`);
  };

  const handleProcessingClick = () => {
    navigate(`/processing/${id}/${targetFeature}`);
  };

  const handleModelsClick = () => {
    navigate(`/models/${id}/${targetFeature}`);
  };

  const handleDBClick = () => {
    navigate(`/importSucc/${id}`);
  };

  const handleDescription = () => {
    navigate(`/description/${id}/${targetFeature}`);
  };
  const handleHistorique = () => {navigate(`/historique/${id}/${targetFeature}`)};
  const handleChange = (e) => {
    console.log('Selected value:', e.target.value); // Ajoutez ce log pour voir la valeur sélectionnée
    setTargetFeature(e.target.value);
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
      <div className="content1">
        <h2>Imported Data</h2>
        <p className="header-subtitle">A Detailed Overview of Your Imported Files</p>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                {data.length > 0 && Object.keys(data[0]).map((key) => (
                  <th key={key}>
                    <div className='col'>{key}</div>
                    <div className="column-type">{columnTypes[key]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="description">
          <p>Total Number of Rows: {totalRows}</p>
          <p>Total Number of Columns: {totalColumns}</p>

          {!isTargetFeatureSet && (
          <div>
            <select
  id="target-feature"
  value={targetFeature}
  onChange={handleChange}
  disabled={isTargetFeatureSet}
>
<option>
Choose Target Feature
    </option>
  {Object.keys(columnTypes).map((column) => (
    <option key={column} value={column}>
      {column}
    </option>
  ))}
</select>
            <button onClick={saveTargetFeature}>Save Target Feature</button>
          </div>
            )}

        {isTargetFeatureSet && (
          <p>Selected Target Feature: {targetFeature}</p>
         )}
      </div>
    </div>
    </>
  );
};

export default ImportSuccess;
