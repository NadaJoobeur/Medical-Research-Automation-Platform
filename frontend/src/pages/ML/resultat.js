import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChartLine, faCog, faBrain, faDatabase, faFileAlt,faChevronDown, faChevronUp,faDownload,faHistory,faRocket}  from '@fortawesome/free-solid-svg-icons';
import { Bar } from 'react-chartjs-2'; // Import Bar chart from Chart.js
import '../../assets/css/test.css';

const Result = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [result, setResult] = useState(null);
    const [showGraph, setShowGraph] = useState({}); // Track graph visibility for each model
    const chartRefs = useRef({}); // Référence pour le graphique (dictionnaire pour plusieurs graphiques)
    const lineStyle = {
        width: '100%',      // largeur de la ligne
        height: '1px',      // épaisseur de la ligne
        backgroundColor: '#a9aeb4', // couleur de la ligne
        margin: '5px 0'    // espacement autour de la ligne
    };
    useEffect(() => {
        // Fetch results from localStorage
        const storedResult = localStorage.getItem('modelResult');
        if (storedResult) {
            setResult(JSON.parse(storedResult));
            console.log("bbbb",JSON.parse(storedResult))
        } else {
            console.error("Aucun résultat trouvé.");
        }
    }, []);
    const handleHistorique=()=>{navigate(`/historique/${id}`)};

    const handleDownloadResult = () => {
        if (!result) {
            console.error("Aucun résultat disponible pour le téléchargement.");
            return;
        }
        
        const rows = [];
        
        // Générer les en-têtes
        rows.push(['Model Name', 'Feature', 'Importance', 'Metric', 'Value']);
        
        // Parcourir les résultats et ajouter les lignes
        Object.keys(result).forEach(modelName => {
            const importances = result[modelName]['Feature Importances'];
            const metrics = result[modelName]['Metrics'];
    
            // Ajouter les importances des caractéristiques
            Object.keys(importances).forEach(feature => {
                rows.push([modelName, feature, `${(importances[feature] * 100).toFixed(2)}%`, '', '']);
            });
    
            // Ajouter les métriques
            Object.keys(metrics).forEach(metric => {
                rows.push([modelName, '', '', metric, metrics[metric].toFixed(2)]);
            });
        });
    
        // Convertir les lignes en CSV
        const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    
        // Créer un lien pour le téléchargement
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "resultats.csv");
        document.body.appendChild(link); // Requis pour Firefox
        link.click();
        document.body.removeChild(link); // Nettoyer
    };
    

    // Toggle graph visibility
    const toggleGraph = (modelName) => {
        setShowGraph((prev) => ({
            ...prev,
            [modelName]: !prev[modelName],
        }));
    };

    const renderFeatureImportances = (importances) => {
        if (!importances || typeof importances !== 'object') {
            return <p>No feature importances available.</p>;
        } else {
            return (
                <table className="result-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Importance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(importances).map((feature, index) => (
                            <tr key={index}>
                                <td>{feature}</td>
                                <td>{(importances[feature] * 100).toFixed(2)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }
    };
    

    // Render metrics in a table
    const renderMetrics = (metrics) => (
        <table className="result-table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody>
                {Object.keys(metrics).map((metric, index) => (
                    <tr key={index}>
                        <td>{metric}</td>
                        <td>{metrics[metric].toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    // Prepare data for the feature importance graph using Chart.js
    const prepareGraphData = (importances) => ({
        labels: Object.keys(importances),
        datasets: [{
            label: 'Feature Importance',
            data: Object.values(importances).map(value => (value * 100).toFixed(2)),
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        }]
    });

    // Handle the Test button click
   
    const handleDownloadChart = (modelName) => {
        const chartInstance = chartRefs.current[modelName];
        
        if (!chartInstance) {
            console.error(`Graphique pour ${modelName} introuvable`);
            return;
        }
        
        try {
            const url = chartInstance.toBase64Image(); // Utilise la méthode correcte pour obtenir l'image du graphique
            const link = document.createElement('a');
            link.href = url;
            link.download = `${modelName}-chart.png`;
            document.body.appendChild(link); // Ajoute le lien au DOM pour le rendre cliquable
            link.click();
            document.body.removeChild(link); // Supprime le lien après le clic
        } catch (error) {
            console.error("Erreur lors du téléchargement du graphique :", error);
        }
    };
    
    
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
                <div className="menu-item" onClick={() => navigate(`/description/${id}`)}>
                    <FontAwesomeIcon icon={faFileAlt} className="menu-icon" /> Description
                </div>
                <div className="menu-item" onClick={() => navigate(`/graphs/${id}`)}>
                    <FontAwesomeIcon icon={faChartLine} className="menu-icon" /> Graphs
                </div>
                <div className="menu-item" onClick={() => navigate(`/processing/${id}`)}>
                    <FontAwesomeIcon icon={faCog} className="menu-icon" /> Processing
                </div>
                <div className="menu-item" onClick={() => navigate(`/models/${id}`)}>
                    <FontAwesomeIcon icon={faBrain} className="menu-icon" /> Models
                </div>
                <div className="menu-item" onClick={() => navigate(`/deployment/${id}`)}>
                    <FontAwesomeIcon icon={faRocket} className="menu-icon" /> Deployment
                </div>
               
               </div>
            <div className="content2">
                <h1>Training Result</h1>
                <div style={lineStyle}></div>
                <p className="header-subtitle">Explore the Results of Model Training </p>

                <div className="container1">
                    <div>
                        {result ? (
                            
                            <div>
                                {Object.keys(result).map((modelName, index) => (
                                    <div key={index} className="result-section">
                                        <div className="model-header">
                                            <h3 className="model-title">{modelName}</h3>
                                      
                                        </div>

                                        <h4>
    Feature Importances
    <div className="button-group">
        <button 
            className="graph-button"
            onClick={() => toggleGraph(modelName)}
            aria-label={showGraph[modelName] ? 'Hide Graph' : 'Show Graph'} // Ajoute une étiquette pour l'accessibilité
        >
            <FontAwesomeIcon icon={showGraph[modelName] ? faChevronUp : faChevronDown} />
        </button>
        {showGraph[modelName] && (
            <button className="download-button" onClick={() => handleDownloadChart(modelName)}>
                <FontAwesomeIcon icon={faDownload} /> {/* Assurez-vous d'importer faDownload */}
            </button>
        )}
    </div>
</h4>
{/* Display the graph if showGraph is true for this model */}
{showGraph[modelName] && (
    <div className="feature-importance-graph">
        <Bar
            data={prepareGraphData(result[modelName]['Feature Importances'])}
            options={{
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }}
            ref={(el) => {
                if (el) {
                    chartRefs.current[modelName] = el.chartInstance; // Assigner la référence pour chaque modèle
                    console.log(`Graphique pour ${modelName} : `, chartRefs.current[modelName]);
                }
            }}
        />
    </div>
)}

                                        {renderFeatureImportances(result[modelName]['Feature Importances'])}
                                        
                                     

                                        <h4>Metrics</h4>
                                        {renderMetrics(result[modelName]['Metrics'])}

                                        <div className="separator-line"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>Aucun résultat disponible.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
    
};

export default Result;
