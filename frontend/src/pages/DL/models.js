import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faDatabase, faHistory, faChartLine, faCog, faBrain, faFilePdf, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import '../../assets/DLcss/models.css';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faRocket } from '@fortawesome/free-solid-svg-icons';

import axios from 'axios';
import { Sync } from '@mui/icons-material';
const ModelsDL = () => {
    const navigate = useNavigate();
    const { id, slicedImages } = useParams();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResultsButton, setShowResultsButton] = useState(false); // Afficher le bouton "Voir les résultats"
    const [modelTrained, setModelTrained] = useState(false);
    const[url,seturl]=useState([])
    const [loadingV1, setLoadingV1] = useState(false);
    const [loadingV2, setLoadingV2] = useState(false);
    const [loadingV3, setLoadingV3] = useState(false);
    const [loadingV4, setLoadingV4] = useState(false);
    const [showResultsButtonV1, setShowResultsButtonV1] = useState(false);
    const [showResultsButtonV2, setShowResultsButtonV2] = useState(false);
    const [showResultsButtonV3, setShowResultsButtonV3] = useState(false);
    const [showResultsButtonV4, setShowResultsButtonV4] = useState(false);
    useEffect(() => {
        console.log("predictions:", predictions);
    }, [predictions]);

    useEffect(() => {
        if (!slicedImages || slicedImages.length === 0) {
            alert(`Prepare your data first in the Processing section. Here's a quick recap of the image preprocessing:
                - Input Size: 256x256 (resize)
                - Slicing: 2 slices per direction
                - Model Patch Size: 128x128`);
        } else {
            console.log('Sliced Images Structure:', slicedImages);
        }
    }, [slicedImages]);
    useEffect(() => {
        const checkResultsExistence = async () => {
            if (!id) return;
    
            const token = localStorage.getItem('token');
            if (!token) {
                alert('User is not authenticated');
                return;
            }
    
            try {
                const response = await axios.get(
                    `http://localhost:5000/dl_routes/model-results/${id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
                
                setModelTrained(response.data.resultsExist); // Mise à jour de l'état
                if (response.data.resultsExist) {
                    setShowResultsButton(true); // Afficher le bouton si les résultats existent
                }
            } catch (error) {
                console.error('Train Your model first', error);
            }
        };
    
        checkResultsExistence();
    }, [id]);
    
    const handleProfileClick = () => navigate('/profile');
    const handleGraphsClick = () => navigate(`/graphsDL/${id}`);
    const handleProcessingClick = () => navigate(`/processingDL/${id}`);
    const handleModelsClick = () => navigate(`/models-options/${id}`);
    const handleSaveClick = () => navigate('/save');
    const handleDBClick = () => navigate(`/importSuccDL/${id}`);
    const handleHistorique = () => {
        navigate(`/historyDL/${id}/${url}`);
    };
    const handleDepClick = () => {
        navigate(`/readMe/${id}`);
      };
    const handleInceptionClick = async (version) => {
        if (!id) {
            alert('Please enter a patient ID');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('User is not authenticated');
            return;
        }
        // Reset all loading states
        setLoadingV1(false);
        setLoadingV2(false);
        setLoadingV3(false);
        setLoadingV4(false);

        // Set loading for the specific version
        if (version === 'v1') setLoadingV1(true);
        if (version === 'v2') setLoadingV2(true);
        if (version === 'v3') setLoadingV3(true);
        if (version === 'v4') setLoadingV4(true);
        
        try {
            const response = await axios.post(
                `http://localhost:5000/dl_routes/version_1/slice-images`,
                { slicedImages, project_id: id },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            console.log(response.data);
            setPredictions(response.data.resultats || []);
    
            // Turn off loading and show results for the specific version
            if (version === 'v1') {
                setLoadingV1(false);
                setShowResultsButtonV1(true);
            }
            if (version === 'v2') {
                setLoadingV2(false);
                setShowResultsButtonV2(true);
            }
            if (version === 'v3') {
                setLoadingV3(false);
                setShowResultsButtonV3(true);
            }
            if (version === 'v4') {
                setLoadingV4(false);
                setShowResultsButtonV4(true);
            }
        } catch (error) {
            console.error('Error while testing:', error);
            alert(`
                Error while testing! Here's a quick recap of the image preprocessing:
                - Input Size: 256x256 (resize)
                - Slicing: 2 slices per direction
                - Model Patch Size: 128x128
                `);
    
            // Turn off loading for the specific version in case of error
            if (version === 'v1') setLoadingV1(false);
            if (version === 'v2') setLoadingV2(false);
            if (version === 'v3') setLoadingV3(false);
            if (version === 'v4') setLoadingV4(false);
        }
    };
    const handlePdfClick = () => {
        // Define the PDF URL
        const pdfUrl = '/VersionV1.pdf'; // Path relative to the public directory
    
        // Open PDF in a new tab
        window.open(pdfUrl, '_blank');
    };
    
    const handleViewResultsClick = (version) => {
        if(version==='V1')
            navigate(`/inception-v1/${id}`);
        if(version==='V2')
            navigate(`/inception-v2/${id}`);
        if(version==='V3')
            navigate(`/inception-v3/${id}`);
        if(version==='V4')
            navigate(`/inception-v4/${id}`);
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
                <div className="menu-item" onClick={handleGraphsClick}>
                    <FontAwesomeIcon icon={faFileAlt} className="menu-icon" /> Description
                </div>
                <div className="menu-item" onClick={handleProcessingClick}>
                    <FontAwesomeIcon icon={faCog} className="menu-icon" /> Processing
                </div>
                <div className="menu-item" onClick={handleDepClick}>
                <FontAwesomeIcon icon={faRocket} className="menu-icon" /> ReadMe
                </div>            
                <div className="menu-item" onClick={handleModelsClick}>
                <FontAwesomeIcon icon={faBrain} className="menu-icon" /> Deployment
                </div>
            </div>
    
            <div className="content1">
                <div className="inception-versions">
                    <h2>Select Inception Version</h2>
                    
                    {/* Inception V1 avec téléchargement PDF */}
                    <div className="inception-option">
                        <h3 onClick={() => handleInceptionClick('v1')}>Inception V1</h3>
                        {loadingV1 && (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
                                <p className="loading-text">Veuillez patienter pendant que le modèle s'entraîne. Cela peut prendre quelques minutes.</p>
                            </>
                        )}
                        
                       

                        {showResultsButtonV1 && !loadingV1 && (
                            <button onClick={handleViewResultsClick('V1')} className="results-button">
                                Voir les résultats
                            </button>
                        )} 
                    </div>
    
                    {/* Inception V2 */}
                    <div className="inception-option">
                        <h3 onClick={() => handleInceptionClick('v2')}>Inception V2</h3>
                        {loadingV2 && (
                        <>
                            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
                            <p className="loading-text">Veuillez patienter pendant que le modèle s'entraîne. Cela peut prendre quelques minutes.</p>
                        </>)}
                        
                        {showResultsButtonV2 && !loadingV2 &&  (
                        <button onClick={handleViewResultsClick('V2')} className="results-button">
                            Voir les résultats
                            </button>
                        )}
                    </div>
    
                    {/* Inception V3 */}
                    <div className="inception-option">
                        <h3 onClick={() => handleInceptionClick('v3')}>Inception V3</h3>
                        {loadingV3 && (
                        <>
                            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
                            <p className="loading-text">Veuillez patienter pendant que le modèle s'entraîne. Cela peut prendre quelques minutes.</p>
                        </>)}
                        
                        {showResultsButtonV3 && !loadingV3 && (
                        <button onClick={handleViewResultsClick('V3')} className="results-button">
                            Voir les résultats
                            </button>
                        )}
                    </div>
    
                    {/* Inception V4 */}
                    <div className="inception-option">
                        <h3 onClick={() => handleInceptionClick('v4')}>Inception V4</h3>
                        {loadingV4 && (
                        <>
                            <FontAwesomeIcon icon={faSpinner} spin className="loading-icon" />
                            <p className="loading-text">Veuillez patienter pendant que le modèle s'entraîne. Cela peut prendre quelques minutes.</p>
                        </>)}
                        
                        {showResultsButtonV4 && !loadingV4 && (
                        <button onClick={handleViewResultsClick('V4')} className="results-button">
                            Voir les résultats
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModelsDL;
