import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { faUser, faChartLine, faCog, faBrain, faDatabase, faFileAlt, faHistory , faRocket} from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-solid-svg-icons';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Enregistrement des composants Chart.js nécessaires
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
const Deployment = () => {
    const navigate = useNavigate();
    const { id, targetFeature } = useParams();
    const [hist, setHist] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [selectedModelData, setSelectedModelData] = useState(null);
    const [showChart, setShowChart] = useState(false);
    const [featureImportanceData, setFeatureImportanceData] = useState({});

    // Fonction pour afficher ou masquer le graphique
    const toggleChart = () => {
        setShowChart(!showChart);
    };
    const importhist = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/ml_routes/models/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                withCredentials: true,
            });
            const rep = response.data;
            setHist(rep);
        } catch (error) {
            alert( error)
            console.error('Erreur lors de la récupération des fichiers modifiés :', error);
        }
    };

    useEffect(() => {
        importhist();
    }, [id, targetFeature]);

    const handleSelectChange = async (event) => {
        const fileId = event.target.value;
        setSelectedFile(fileId);

        if (fileId) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/ml_routes/model/${fileId}`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    withCredentials: true,
                });
                const modelData = response.data;
                setSelectedModelData(modelData);
            } catch (error) {
                alert( error)
                console.error('Erreur lors de la récupération des détails du modèle :', error);
            }
        }
    };
    const handleTestClick = (modelName) => {
        navigate(`/test/${id}/${modelName}`);
    };
    const handleProfileClick = () => navigate('/profile');
    const handleGraphsClick = () => navigate(`/graphs/${id}/${targetFeature}`);
    const handleProcessingClick = () => navigate(`/processing/${id}/${targetFeature}`);
    const handleModelsClick = () => navigate(`/models/${id}/${targetFeature}`);
    const handleDBClick = () => navigate(`/importSucc/${id}`);
    const handleDescription = () => navigate(`/description/${id}/${targetFeature}`);
    const handleHistorique = () => navigate(`/historique/${id}/${targetFeature}`);
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
                <h2>Deployment</h2>
                <p className="header-subtitle">A Detailed Overview of Your Model</p>

                {/* Affichage de la valeur de targetFeature */}
                <p><strong>Target Feature:</strong> {targetFeature || 'Not available'}</p>

                {/* Sélection du modèle */}
                {hist.length > 0 ? (
                    <select onChange={handleSelectChange} value={selectedFile}>
                        <option value="">Select Model</option>
                        {hist.map((file) => (
                            <option key={file.id} value={file.id}>{file.name}</option>
                        ))}
                    </select>
                ) : (
                    <p>No Model available.</p>
                )}

                {/* Affichage des détails du modèle sélectionné */}
                {/* Affichage des détails du modèle sélectionné */}
{selectedModelData && (
    <div className="model-details">
        <h3>Model: {selectedModelData.name}</h3>
        <button className="test-button" onClick={() => handleTestClick(selectedModelData.name)}>
                                                Test
        </button>
        
        {/* Affichage du training set et test set, sinon k */}
        <h4>Model Parameters</h4>

        {selectedModelData.trainingset > 0 && selectedModelData.testset > 0 ? (
            <>
                        <tr>
                            <td><strong>Training Set</strong></td>
                            <td>{selectedModelData.trainingset}</td>
                        </tr>
                        <tr>
                            <td><strong>Test Set</strong></td>
                            <td>{selectedModelData.testset}</td>
                        </tr>

            </>
        ) : (
            <tr>
                            <td><strong>k-folds</strong></td>
                            <td>{selectedModelData.k}</td>
                        </tr>
        )}

         {/* Affichage des métriques si > 1 */}
         <div className="metrics" style={{ marginBottom: "20px" }}>
            <h4>Evaluation Metrics</h4>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                    {selectedModelData.Accuracy > 0 && (
                        <tr>
                            <td><strong>Accuracy</strong></td>
                            <td>{selectedModelData.Accuracy}</td>
                        </tr>
                    )}
                    {selectedModelData.Precisionn > 0 && (
                        <tr>
                            <td><strong>Precision</strong></td>
                            <td>{selectedModelData.Precisionn}</td>
                        </tr>
                    )}
                    {selectedModelData.F1_Score > 0 && (
                        <tr>
                            <td><strong>F1 Score</strong></td>
                            <td>{selectedModelData.F1_Score}</td>
                        </tr>
                    )}
                    {selectedModelData.ROC_AUC > 0 && (
                        <tr>
                            <td><strong>ROC AUC</strong></td>
                            <td>{selectedModelData.ROC_AUC}</td>
                        </tr>
                    )}
                    {selectedModelData.MeanAbsoluteError > 0 && (
                        <tr>
                            <td><strong>Mean Absolute Error</strong></td>
                            <td>{selectedModelData.MeanAbsoluteError}</td>
                        </tr>
                    )}
                    {selectedModelData.MeanSquaredError > 0 && (
                        <tr>
                            <td><strong>Mean Squared Error</strong></td>
                            <td>{selectedModelData.MeanSquaredError}</td>
                        </tr>
                    )}
                    {selectedModelData.RScore > 0 && (
                        <tr>
                            <td><strong>R² Score</strong></td>
                            <td>{selectedModelData.RScore}</td>
                        </tr>
                    )}
                    {selectedModelData.Recall > 0 && (
                        <tr>
                            <td><strong>Recall</strong></td>
                            <td>{selectedModelData.Recall}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Affichage de feature importance sous forme de tableau */}
        <div className="feature-importance">
            <h4>Feature Importance</h4>
            {selectedModelData.featureimportance ? (
    (() => {
        try {
            // Correction : Remplacer les guillemets simples par des guillemets doubles
            const correctedFeatureImportance = selectedModelData.featureimportance.replace(/'/g, '"');
            
            // Parser la chaîne corrigée
            const featureImportanceData = JSON.parse(correctedFeatureImportance);

            // Trier les caractéristiques par ordre croissant d'importance
            const sortedFeatureImportance = Object.entries(featureImportanceData).sort(([featureA, importanceA], [featureB, importanceB]) => importanceA - importanceB);

            // Retourner un tableau HTML pour afficher les caractéristiques et leurs importances
            return (
                <table>
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Importance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedFeatureImportance.map(([feature, importance]) => (
                            <tr key={feature}>
                                <td>{feature}</td>
                                <td>{importance}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        } catch (error) {
            console.error('Erreur de parsing JSON pour featureimportance:', error);
            return <p>Impossible de parser les importances des caractéristiques.</p>;
        }
    })()
) : (
    <p>Aucune importance des caractéristiques disponible.</p>
)}
        </div>
    </div>
)}

            </div>
        </>
    );
};

export default Deployment;
