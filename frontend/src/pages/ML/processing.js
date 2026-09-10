import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import { faUser, faChartLine, faCog, faDatabase, faClone, faFileAlt, faTrash ,faHistory, faBrain,faRocket} from '@fortawesome/free-solid-svg-icons';
import '../../assets/css/Processing.css';
import { mean} from 'mathjs';
import axios from 'axios';
import { faBroom, faArrowsRotate, faDownload } from '@fortawesome/free-solid-svg-icons';
import KNN from 'ml-knn';
import { useLocation } from 'react-router-dom';

const Processing = () => {
  const location = useLocation();

  const navigate = useNavigate();
  const { id, targetFeature ,fileData} = useParams();
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectedColumnsNr, setSelectedColumnsNr] = useState([]);
  const [normalizedColumns, setNormalizedColumns] = useState([]); // Nouveau state pour les colonnes normalisées
  const [isOpen1, setIsOpen1] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [showDropdown3, setShowDropdown3] = useState(false);
  const [selectedColumnsImp, setSelectedColumnsImp] = useState([]);

  
  const handleColumnCheckboxChangeImp = (column) => {
    setSelectedColumnsImp(prevSelectedColumns => {
      if (prevSelectedColumns.includes(column)) {
        // Retirer la colonne du tableau si elle est déjà sélectionnée
        return prevSelectedColumns.filter(col => col !== column);
      } else {
        // Ajouter la colonne au tableau si elle n'est pas encore sélectionnée
        return [...prevSelectedColumns, column];
      }
    });
  };
  const toggleDropdown = () => {
    setShowDropdown(prevState => !prevState);
  };
  // Fonction pour basculer l'état de la liste déroulante
  const toggleDropdown1 = () => {
    setIsOpen1(prevState => !prevState);
  };
  const toggleDropdown2 = () => {
    setIsOpen2(prevState => !prevState);
  };
  const toggleDropdown3 = () => {
    setIsOpen3(prevState => !prevState);
  };
  const toggleDropdown4 = () => {
    setShowDropdown3(prevState => !prevState);
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

      if (typeof data === 'object') {
       
        cleanedData = cleanData(data.data);
      } else if (typeof data === 'string') {
        try {
          const sanitizedData = sanitizeJson(data);
          const parsedData = JSON.parse(sanitizedData);

        
          cleanedData = cleanData(parsedData.data);
        } catch (e) {
          console.error('Error parsing JSON data:', e);
          setError('Error parsing JSON data');
          setLoading(false);
          return;
        }
      } else {
        setError('Unexpected response format');
        setLoading(false);
        return;
      }

      if (Array.isArray(cleanedData)) {
        setData(cleanedData);
        setFilteredData(cleanedData);
      } else if (typeof cleanedData === 'string') {
        try {
          const parsedData = JSON.parse(cleanedData);
          setData(parsedData);
          setFilteredData(parsedData);
        } catch (e) {
          setError('Error parsing cleaned data');
        }
      } else {
        setError('Unexpected data format');
      }
    } catch (error) {
      console.error('Error fetching imported files:', error);
      setError('Error fetching data from server');
      alert( error)

    } finally {
      setLoading(false);
    }
  };

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
        setFilteredData(decodedFiltdate)
  
        // Afficher les données décodées dans la console
        console.log(decodedFiltdate);
      } catch (error) {
        console.error("Erreur lors du décodage des données:", error);
      }
    } else {
      importBD(); // Si fileData n'existe pas, importez la BD
    }
  }, [id, location.search]);

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
    const encodedFiltdate = encodeURIComponent(JSON.stringify(filteredData)); // encodage du tableau en JSON

    navigate(`/models/${id}/${targetFeature}/${filteredData}?filtdate=${encodedFiltdate}`);   
  };

  const handleDBClick = () => {
    navigate(`/importSucc/${id}`);
  };

  const handleDescription = () => {
    navigate(`/description/${id}/${targetFeature}`);
  };
  const handleHistorique=()=>{navigate(`/historique/${id}/${targetFeature}`)};
  const handleDataCleaning = () => {
    const means = {};
    const columns = Object.keys(filteredData[0] || {});
    let missingValueCount = 0;

    columns.forEach(column => {
      const values = filteredData.map(row => row[column]).filter(value => value !== null && !isNaN(value));
      means[column] = mean(values);
    });

    const cleanedData = filteredData.map(row => {
     
      const cleanedRow = { ...row };
      columns.forEach(column => {
        if (cleanedRow[column] === null || isNaN(cleanedRow[column])) {
          missingValueCount++;
          cleanedRow[column] = means[column] || 0;
        }
      });
      return cleanedRow;
    });
    setFilteredData(cleanedData);
    alert(`Number of missing values found: ${missingValueCount}`);
  };
  const handleDataTransformation = (type) => {
    // Vérifie si des colonnes sont sélectionnées
    if (selectedColumnsNr.length === 0) {
      alert("Veuillez sélectionner au moins une colonne pour normaliser.");
      return;
    }
  
    // Initialiser les objets pour stocker les moyennes et écarts-types
    let columnMeans = {};
    let columnStdDevs = {};
  
    // Calculer les moyennes et écarts-types pour chaque colonne sélectionnée si nécessaire
    if (type === 'Z-Score Normalization' || type === 'Mean Normalization') {
      selectedColumnsNr.forEach(column => {
        const values = filteredData.map(row => row[column]).filter(value => value !== null && value !== undefined);
        const mean = values.reduce((acc, val) => acc + val, 0) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
    
        columnMeans[column] = mean;
        columnStdDevs[column] = stdDev;
      });
    }
  
    // Exécuter la normalisation basée sur le type sélectionné
    let normalizedData = filteredData.map(row => {
      let newRow = { ...row };
  
      selectedColumnsNr.forEach(column => {
        if (newRow[column] !== null && newRow[column] !== undefined) {
          const value = newRow[column];
          switch (type) {
            case 'Min-Max Normalization':
              // Min-Max Normalization
              const min = Math.min(...filteredData.map(row => row[column]));
              const max = Math.max(...filteredData.map(row => row[column]));
              newRow[column] = (value - min) / (max - min);
              break;
  
            case 'Z-Score Normalization':
              // Z-Score Normalization
              const mean = columnMeans[column];
              const stdDev = columnStdDevs[column];
              newRow[column] = (value - mean) / stdDev;
              break;
  
            case 'Decimal Scaling':
              // Decimal Scaling
              const maxAbsValue = Math.max(...filteredData.map(row => Math.abs(row[column])));
              const j = Math.ceil(Math.log10(maxAbsValue + 1));
              newRow[column] = value / Math.pow(10, j);
              break;
  
            case 'Mean Normalization':
              // Mean Normalization
              const minVal = Math.min(...filteredData.map(row => row[column]));
              const maxVal = Math.max(...filteredData.map(row => row[column]));
              const meanVal = columnMeans[column];
              newRow[column] = (value - meanVal) / (maxVal - minVal);
              break;
  
            case 'Logarithmic Scaling':
              // Logarithmic Scaling
              newRow[column] = Math.log(value + 1);
              break;
  
            default:
              console.error("Type de normalisation non reconnu");
              break;
          }
        }
      });
  
      return newRow;
    });
    setNormalizedColumns(prevState => [...prevState, ...selectedColumnsNr]);

  // Vider la sélection actuelle après normalisation
   setSelectedColumnsNr([]);
    setFilteredData(normalizedData);
    alert(`Normalisation ${type} terminée.`);
  };
  


  const handleDatadouble = () => {
    const uniqueRows = new Set();
    const dt = filteredData.filter((row) => {
      const rowValues = Object.values(row).join('|');
      if (uniqueRows.has(rowValues)) {
        return false;
      } else {
        uniqueRows.add(rowValues);
        return true;
      }
    });

    setFilteredData(dt);
    alert(`Number of duplicates removed: ${data.length - filteredData.length}`);
  };

  const handleDownload = () => {
    const csvData = [
        Object.keys(filteredData[0] || {}).join(','),  // En-têtes
        ...filteredData.slice(0, 15).map(row => Object.values(row).join(','))  // Lignes de données
    ].join('\n');

    // Ajout d'un BOM UTF-8 au début du fichier pour garantir l'encodage correct
    const utf8BOM = '\uFEFF';  // Byte Order Mark UTF-8
    const blob = new Blob([utf8BOM + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'processed_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
};
  const calculateNullPercentages = () => {
    const columns = Object.keys(filteredData[0] || {});
    const totalRows = filteredData.length;
    const nullPercentages = {};

    columns.forEach(column => {
      const nullCount = filteredData.filter(row => row[column] === null || row[column] === '').length;
      const percentage = (nullCount / totalRows) * 100;
      nullPercentages[column] = percentage;
    });

    return nullPercentages;
  };


  const nullPercentages = calculateNullPercentages();
  const columnsWithHighNulls = Object.keys(nullPercentages).filter(column => nullPercentages[column] > 20);

  const handleColumnCheckboxChange = (column) => {
    setSelectedColumns(prevSelectedColumns =>
      prevSelectedColumns.includes(column)
        ? prevSelectedColumns.filter(c => c !== column)
        : [...prevSelectedColumns, column]
    );
  };
  const handleColumnCheckboxChangeNr = (column) => {
    setSelectedColumnsNr(prevSelectedColumns => {
      if (prevSelectedColumns.includes(column)) {
        // Si la colonne est déjà sélectionnée, la retirer de la sélection
        return prevSelectedColumns.filter(col => col !== column);
      } else {
        // Sinon, ajouter la colonne à la sélection
        return [...prevSelectedColumns, column];
      }
    });
  };
  

  const handleRemoveSelectedColumns = () => {
    if (selectedColumns.length === 0) {
      alert("Veuillez sélectionner au moins une colonne pour suppression.");
      return;
    }
    const cleanedData = filteredData.map(row => {
      const newRow = { ...row };
      selectedColumns.forEach(column => {
        delete newRow[column];
      });
      return newRow;
    });
    setFilteredData(cleanedData);
  };
  const getCellClassName = (column) => {
    if (nullPercentages[column] > 20) {
      return 'cell-red'; // Classe CSS pour les cellules rouges
    }
    return '';
  };
  const getRowClassName = (row) => {
    const hasNulls = Object.values(row).some(value => value === null || value === ''|| value === 'N/A	');
    return hasNulls ? 'row-green' : '';
  };
  const headers = filteredData.length ? Object.keys(filteredData[0]).filter(header => header !== targetFeature) : [];
  const rows = filteredData;
  const availableColumns = headers.filter(header => !normalizedColumns.includes(header));
  const handleSave = async () => {
    console.log({filteredData})
    try {
      const response = await fetch(`http://localhost:5000/ml_routes/save-data/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filteredData}), // Envoyer les données sous forme JSON
      });

      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      const result = await response.json();
      console.log('Success:', result);
      alert("Your data changes are successfully saved")
      // Vous pouvez également ajouter du code pour gérer la réponse ici, par exemple afficher un message de succès
    } catch (error) {
      console.error('Error:', error);
      // Gérez les erreurs ici, par exemple afficher un message d'erreur
    }
  };

  const handleImputation = (method) => {
    if ( selectedColumnsImp.length === 0) {
      console.error('Aucune colonne sélectionnée pour l’imputation.');
      return;
    }
  
    const updatedData = (() => {
      switch (method) {
        case 'Mean Imputation':
          console.log("Mean Imputation")
          return imputeByMean(filteredData, selectedColumnsImp);
          case 'Median Imputation':
          console.log("Median Imputation")
          return selectedColumnsImp.reduce((acc, col) => imputeByMedian(acc, col), filteredData);
        case 'Mode Imputation':
          console.log("Mode Imputation")
          return selectedColumnsImp.reduce((acc, col) => imputeByMode(acc, col), filteredData);
        case 'KNN Imputation':
          console.log("KNN Imputation")
          return imputeByKNN(filteredData, selectedColumnsImp);
        
        case 'Interpolation Imputation':
          return selectedColumnsImp.reduce((acc, col) => imputeByInterpolation(acc, col), filteredData);
          case 'Zero Imputation':  // Nouveau cas ajouté
          console.log("Zero Imputation");
          return imputeByZero(filteredData, selectedColumnsImp);
        default:
          console.error('Méthode d’imputation non reconnue :', method);
          return filteredData;
      }
    })();
  
    setFilteredData(updatedData);
  };

  const imputeByZero = (data, columns) => {
    return data.map(row => {
      // Créez une copie de la ligne
      const newRow = { ...row };
  
      // Remplacez les valeurs manquantes (null ou undefined) par 0 uniquement pour les colonnes sélectionnées
      columns.forEach(col => {
        if (newRow[col] === null || newRow[col] === undefined) {
          newRow[col] = 0;
        }
      });
  
      return newRow;
    });
  };
  
  const imputeByMean = (data, columns) => {
    // Créez une copie des données pour éviter les modifications en place
    const updatedData = data.map(row => ({ ...row }));
  
    // Pour chaque colonne spécifiée, calculez la moyenne et imputez les valeurs manquantes
    columns.forEach(col => {
      // Obtenez les valeurs valides pour la colonne
      const validValues = updatedData
        .map(d => d[col])
        .filter(value => value !== null && value !== undefined && !isNaN(value));
  
      // Calculez la moyenne
      const mean = validValues.reduce((acc, value) => acc + value, 0) / validValues.length;
  
      // Remplacez les valeurs manquantes par la moyenne
      updatedData.forEach(row => {
        if (row[col] === 'N/A' || row[col] === undefined || row[col] === null) {
          row[col] = mean;
        }
      });
    });
  
    return updatedData;
  };
  
  
  const imputeByMedian = (data, column) => {
    const validValues = data.map(row => row[column]).filter(value => value !== null && value !== undefined && !isNaN(value));
    validValues.sort((a, b) => a - b);
    const medianIndex = Math.floor(validValues.length / 2);
    const median = validValues.length % 2 === 0
      ? (validValues[medianIndex - 1] + validValues[medianIndex]) / 2
      : validValues[medianIndex];
  
    return data.map(row => {
      if (row[column] === null || row[column] === undefined || isNaN(row[column])) {
        return { ...row, [column]: median };
      }
      return row;
    });
  };
  
  const imputeByMode = (data, column) => {
    const validValues = data.map(row => row[column]).filter(value => value !== null && value !== undefined);
    const frequencyMap = validValues.reduce((map, value) => {
      map[value] = (map[value] || 0) + 1;
      return map;
    }, {});
    const mode = Object.keys(frequencyMap).reduce((a, b) => frequencyMap[a] > frequencyMap[b] ? a : b);
  
    return data.map(row => {
      if (row[column] === null || row[column] === undefined) {
        return { ...row, [column]: mode };
      }
      return row;
    });
  };
  
  const imputeByInterpolation = (data, column) => {
    let lastKnownValue = null;
    return data.map(row => {
      if (row[column] === null || row[column] === undefined || isNaN(row[column])) {
        const nextKnownRow = data.find(r => r[column] !== null && r[column] !== undefined && r !== row);
        const nextKnownValue = nextKnownRow ? nextKnownRow[column] : null;
        const interpolatedValue = lastKnownValue !== null && nextKnownValue !== null
          ? (lastKnownValue + nextKnownValue) / 2
          : lastKnownValue; 
        return { ...row, [column]: interpolatedValue };
      } else {
        lastKnownValue = row[column];
        return row;
      }
    });
  };
  const imputeByKNN = (data, columns, k = 5) => {
    // Filtrer les lignes valides (sans valeurs manquantes)
    const validData = data.filter(row => columns.every(col => row[col] !== null && row[col] !== undefined));
    
    // Vérifier s'il existe des données valides
    if (validData.length === 0) {
      console.warn('Pas de données valides pour entraîner le modèle KNN.');
      return data;
    }
  
    // Extraire les caractéristiques (X) et les étiquettes (y)
    const X = validData.map(row => columns.map(col => row[col]));
    const y = validData.map(row => columns.map(col => row[col]));
  
    // Créer un modèle KNN avec les données valides
    const knn = new KNN(X, y, { k });
  
    // Parcourir toutes les lignes et imputer les valeurs manquantes
    return data.map(row => {
      const newRow = { ...row };
      
      // Vérifier si cette ligne contient des valeurs manquantes
      if (columns.some(col => row[col] === null || row[col] === undefined)) {
        // Extraire les caractéristiques pour cette ligne
        const features = columns.map(col => row[col] !== null && row[col] !== undefined ? row[col] : 0); // Remplacer par 0 ou une autre valeur par défaut si nécessaire
        
        // Appliquer KNN pour prédire les valeurs manquantes
        // Convertir en tableau de tableau pour la méthode predict
        const imputedValues = knn.predict([features]);
  
        // Remplacer les valeurs manquantes par les valeurs imputées
        columns.forEach((col, idx) => {
          if (row[col] === null || row[col] === undefined) {
            newRow[col] = imputedValues[0][idx]; // Première prédiction
          }
        });
      }
  
      return newRow;
    });
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
        <h2>Pre-processing Data</h2>
        <p className="header-subtitle">Clean, Transform, and Organize Your Dataset</p>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        <div className='content3'> 
        <button onClick={handleDataCleaning}><FontAwesomeIcon icon={faTrash} /> Remove rows with Nulls</button>
        <div className="column-selection">
      <button onClick={handleRemoveSelectedColumns} className="btnn">
        <FontAwesomeIcon icon={faTrash} /> Remove Columns with Nulls
      </button>
      <div className="column-selection">
      <button className="dropdown-toggle" onClick={toggleDropdown1}>
      Select Columns
      </button>
      {isOpen1 && (
        <div className="dropdown-menu1">
          {columnsWithHighNulls.map(column => (
            <div key={column} className="checkbox-container">
              <input
                type="checkbox"
                id={`checkbox-${column}`}
                value={column}
                checked={selectedColumns.includes(column)}
                onChange={() => handleColumnCheckboxChange(column)}
              />
              <label htmlFor={`checkbox-${column}`}>{column}</label>
            </div>
          ))}
       
        </div>
      )}

    </div>  
     </div>
     <div className="action-row">
  <div className="normalization-container">
    <button onClick={toggleDropdown4}>
      <FontAwesomeIcon icon={faArrowsRotate} /> Imputation
    </button>
    {showDropdown3 && (
      <ul className="dropdown-menu1">
        <li><button className="dropdown-btn" onClick={() => handleImputation('Mean Imputation')}>Mean Imputation</button></li>
        <li><button className="dropdown-btn" onClick={() => handleImputation('Median Imputation')}>Median Imputation</button></li>
        <li><button className="dropdown-btn" onClick={() => handleImputation('Mode Imputation')}>Mode Imputation</button></li>
        <li><button className="dropdown-btn" onClick={() => handleImputation('KNN Imputation')}>KNN Imputation</button></li>
        <li><button className="dropdown-btn" onClick={() => handleImputation('Interpolation Imputation')}>Interpolation Imputation</button></li>
        <li><button className="dropdown-btn" onClick={() => handleImputation('Zero Imputation')}>Zero Imputation</button></li> {/* Nouvelle option ajoutée */}

      </ul>
    )}
  </div>
  <div className="column-selection">
    <button className="dropdown-toggle" onClick={toggleDropdown3}>
    Select Columns
    </button>
    {isOpen3 && (
      <ul className="dropdown-menu1">
        {availableColumns.map(header => (
          <li key={header} className="checkbox-container">
            <input
              type="checkbox"
              id={`checkbox-${header}`}
              value={header}
              checked={selectedColumnsImp.includes(header)}
              onChange={() => handleColumnCheckboxChangeImp(header)}
            />
            <label htmlFor={`checkbox-${header}`}>{header}</label>
          </li>
        ))}
      </ul>
    )}
  </div>
</div>
        <button onClick={handleDatadouble}><FontAwesomeIcon icon={faClone} /> Remove Duplicates</button>
        <div className="action-row">
            <div className="normalization-container">
              <button onClick={toggleDropdown}>
                <FontAwesomeIcon icon={faArrowsRotate} /> Data Normalization
              </button>
              {showDropdown &&(
              <ul className="dropdown-menu1">
                <li><button className="dropdown-btn"  onClick={() => handleDataTransformation('Min-Max Normalization')}>Min-Max Normalization</button></li>
                <li><button className="dropdown-btn" onClick={() => handleDataTransformation('Z-Score Normalization')}>Z-Score Normalization</button></li>
                <li><button className="dropdown-btn" onClick={() => handleDataTransformation('Decimal Scaling')}>Decimal Scaling</button></li>
                <li><button className="dropdown-btn" onClick={() => handleDataTransformation('Mean Normalization')}>Mean Normalization</button></li>
                <li><button className="dropdown-btn" onClick={() => handleDataTransformation('Logarithmic Scaling')}>Logarithmic Scaling</button></li>
              </ul>)}
            </div>
          <div className="column-selection">
      <button className="dropdown-toggle" onClick={toggleDropdown2}>
      Select Columns
      </button>
      {isOpen2 && (
        <ul className="dropdown-menu1">
          {availableColumns.map(header => (
            <li key={header} className="checkbox-container">
              <input
                type="checkbox"
                id={`checkbox-${header}`}
                value={header}
                checked={selectedColumnsNr.includes(header)}
                onChange={() => handleColumnCheckboxChangeNr(header)}
              />
              <label htmlFor={`checkbox-${header}`}>{header}</label>
            </li>
          ))}
        </ul>
      )}
    </div>

</div>
        
        </div>
        <div className="data-preview">
          <h3>Data Preview</h3>
          <div className="table-container">
          {rows.length > 0 && (
            <table>
              <thead>
                <tr>
                  {headers.map(header => (
                    <th key={header} className={getCellClassName(header)}>{header }</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={getRowClassName(row)}>
                      {headers.map(column => (
                        <td key={column} className={getCellClassName(column)}>
                          {row[column] !== null ? row[column] : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          </div>
          <button onClick={handleDownload}>
          <FontAwesomeIcon icon={faDownload} /> Download Data
        </button>
        <button onClick={handleSave}>
          <FontAwesomeIcon icon={faDownload} /> save change
        </button>
        </div>
      </div>
    </>
  );
};
export default Processing;


