import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { faUser, faChartLine, faCog, faBrain, faDatabase, faFileAlt, faHistory, faRocket, faDownload } from '@fortawesome/free-solid-svg-icons';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registering necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const ReadMe = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [hist, setHist] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [selectedModelData, setSelectedModelData] = useState(null);
    const [showDownloadIcon, setShowDownloadIcon] = useState(false);

    useEffect(() => {
        setHist(["Inception V1", "Inception V2", "Inception V3", "Inception V4"]);
    }, [id]);

    const handleSelectChange = async (event) => {
        const modelName = event.target.value;
        setSelectedFile(modelName);
        // Logic to fetch model data if necessary
        // For now, we will just simulate it with a dummy object
        if (modelName) {
            setSelectedModelData({ name: modelName, downloadUrl: `/VersionV1.pdf` }); // Example URL
            setShowDownloadIcon(true);
        } else {
            setSelectedModelData(null);
            setShowDownloadIcon(false);
        }
    };
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = selectedModelData.downloadUrl; // Use the actual download URL here
        link.setAttribute('download', selectedModelData.name); // Set the filename for download
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    };

    const handleProfileClick = () => navigate('/profile');
 
    const handleProcessingClick = () => navigate(`/processingDL/${id}`);
 
    const handleDBClick = () => navigate(`/importSuccDL/${id}`);
    const handleDescription = () => navigate(`/graphsDL/${id}`);
    const handleHistorique = () => navigate(`/historyDL/${id}`);
    const handleDepClick=() => navigate(`/readMe/${id}`)
    const handlemodelsClick = () => navigate(`/modelsDL/${id}`);

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
                
                <div className="menu-item" onClick={handleProcessingClick}>
                    <FontAwesomeIcon icon={faCog} className="menu-icon" /> Processing
                </div>               
                <div className="menu-item" onClick={handleDepClick}>
                    <FontAwesomeIcon icon={faRocket} className="menu-icon" /> ReadMe
                </div>
                <div className="menu-item" onClick={handlemodelsClick}>
                    <FontAwesomeIcon icon={faBrain} className="menu-icon" /> Deployment
                </div>
            </div>
            <div className="content1">
                <h2>Read me</h2>
                <p className="header-subtitle">A Detailed Overview of Your Model</p>
                {hist.length > 0 ? (
                    <select onChange={handleSelectChange} value={selectedFile}>
                        <option value="">Select Model Description</option>
                        {hist.map((file) => (
                            <option key={file} value={file}>{file}</option>
                        ))}
                    </select>
                ) : (
                    <p>No Model available.</p>
                )}
                {selectedModelData && (
                    <div className="model-details">
                        <h3>Model: {selectedModelData.name}</h3>
                        {showDownloadIcon && (
                            <button onClick={handleDownload} className="download-button">
                                <FontAwesomeIcon icon={faDownload} /> Download Model
                            </button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default ReadMe;
