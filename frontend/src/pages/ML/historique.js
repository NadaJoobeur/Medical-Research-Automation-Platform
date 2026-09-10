import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { faUser, faChartLine, faCog, faBrain, faDatabase, faFileAlt, faHistory ,faRocket} from '@fortawesome/free-solid-svg-icons';

const Historique = () => {
    const navigate = useNavigate();
    const { id, targetFeature} = useParams();
    const [hist, setHist] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [fileData, setFileData] = useState(null);

    const importhist = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/ml_routes/historique/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                withCredentials: true,
            });
            const rep = response.data;
            console.log('Historique des fichiers modifiés :', rep);
            setHist(rep);
        } catch (error) {
            alert( error)

            console.error('Erreur lors de la récupération des fichiers modifiés :', error);
        }
    };

    useEffect(() => {
        console.log("aaaaaaaaaa:",targetFeature); // Debug to check targetFeature
        console.log("bb:", id);
        importhist();
        console.log("filterdata:",fileData)
    }, [id, targetFeature,fileData]);

    const handleSelectChange = async (event) => {
        const fileId = event.target.value;
        setSelectedFile(fileId);

        if (fileId) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/ml_routes/fichier/${fileId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    withCredentials: true,
                });

                let rawData = response.data.data;

                // Log the raw data for inspection
                console.log('Raw Data:', rawData);

                // Clean the raw data if it contains unwanted text
                rawData = rawData.replace(/filteredData/g, '').trim();

                // Handle encoding issues
                rawData = rawData.replace(/\\n/g, '').replace(/\r\n/g, '\n');

                // Separate JSON objects if they are concatenated
                const jsonStrings = rawData.split('\n').filter(Boolean);

                const parsedDataArray = [];
                
                for (const jsonString of jsonStrings) {
                    try {
                        // Ensure proper JSON formatting
                        let cleanedString = jsonString.replace(/'/g, '"').trim();
                        cleanedString = cleanedString.replace(/\bNone\b/g, 'null');

                        // Remove any non-JSON text at the start or end
                        if (cleanedString.startsWith('"')) cleanedString = cleanedString.slice(1);
                        if (cleanedString.endsWith('"')) cleanedString = cleanedString.slice(0, -1);

                        // Ensure JSON is properly formatted
                        cleanedString = cleanedString.replace(/\\\//g, '/');
                        
                        const parsedData = JSON.parse(cleanedString);

                        // Handle cases where data is an array
                        if (Array.isArray(parsedData)) {
                            parsedDataArray.push(...parsedData);
                        } else {
                            parsedDataArray.push(parsedData);
                        }
                    } catch (error) {
                        console.error('Error parsing JSON string:', jsonString, error);
                    }
                }

                console.log('Parsed Data:', parsedDataArray);

                // Update state with parsed data
                setFileData(parsedDataArray);

                
            } catch (error) {
                alert( error)

                console.error('Error retrieving file data:', error);
            }
        }
    };

    const handleProfileClick = () => navigate('/profile');
    const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
    const handleProcessingClick = () => navigate(`/processing/${id}/${targetFeature}`);
    const handleModelsClick = () =>  {
        const encodedFiltdate = encodeURIComponent(JSON.stringify(fileData)); // encodage du tableau en JSON

        navigate(`/models/${id}/${targetFeature}/${encodedFiltdate}`);   
    };
    const handleDBClick = () => navigate(`/importSucc/${id}`);
    const handleDescription = () =>  navigate(`/description/${id}/${targetFeature}`);
    const handleHistorique = () => navigate(`/historique/${id}/${targetFeature}`);
    const goToModel = () => {
        const encodedFiltdate = encodeURIComponent(JSON.stringify(fileData)); // encodage du tableau en JSON

        navigate(`/models/${id}/${targetFeature}/${fileData}?filtdate=${encodedFiltdate}`);   
    };
    const handleDepClick = () => navigate(`/deployment/${id}/${targetFeature}`);

    const goToProcessing = () => {
        const encodedFiltdate = encodeURIComponent(JSON.stringify(fileData)); // encodage du tableau en JSON

        navigate(`/processing/${id}/${targetFeature}/${fileData}?filtdate=${encodedFiltdate}`);   
    };
    const getTableHeaders = () => {
        if (fileData && fileData.length > 0) {
            return Object.keys(fileData[0]);
        }
        return [];
    };

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
                <h2>History</h2>
                <p className="header-subtitle">A Detailed Overview of Your File Modifications</p>

                {/* Affichage de la valeur de targetFeature */}
                <p><strong>Target Feature:</strong> {targetFeature || 'Not available'}</p>
                {hist.length > 0 ? (
                    <select onChange={handleSelectChange} value={selectedFile}>
                        <option value="">Select a file</option>
                        {hist.map((file) => (
                            <option key={file.id} value={file.id}>{file.name}</option>
                        ))}
                    </select>
                ) : (
                    <p>No history available.</p>
                )}

                {fileData && (
                    <div className="file-data">
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>
                                Data for {hist.find(file => file.id === parseInt(selectedFile))?.name}
                            </h3>
                            <button onClick={goToModel} style={{ marginLeft: '10px' }}>
                                Go to Model
                            </button>
                            <button onClick={goToProcessing} style={{ marginLeft: '10px' }}>
                                Go to Processing
                            </button>
                          </div>
                        {fileData.length > 0 ? (
                            <table border="1">
                                <thead>
                                    <tr>
                                        {getTableHeaders().map(header => (
                                            <th key={header}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fileData.map((row, index) => (
                                        <tr key={index}>
                                            {getTableHeaders().map(header => (
                                                <td key={header}>{row[header] != null ? JSON.stringify(row[header]) : ''}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No data available for the selected file.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default Historique;
