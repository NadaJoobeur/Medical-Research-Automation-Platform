import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChartLine, faCog, faBrain, faDatabase,faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import '../../assets/DLcss/InceptionV1.css';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { faRocket } from '@fortawesome/free-solid-svg-icons';

const InceptionV1 = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [predictionListe, setPredictionListe] = useState([]);
    const [error, setError] = useState('');
    const [imageUrls, setImageUrls] = useState([]);
    const [showDownloadButton, setShowDownloadButton] = useState(false); // Nouvel état

    const handleProfileClick = () => navigate('/profile');
    const handleGraphsClick = () => navigate(`/graphsDL/${id}`);
    const handleProcessingClick = () => navigate(`/processingDL/${id}`);
    const handleModelsClick = () => navigate(`/models-options/${id}`);
    const handleDBClick = () => navigate(`/importSuccDL/${id}`);
    const handleDepClick = () => {
        navigate(`/readMe/${id}`);
    };
    const fetchPredictions = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/dl_routes/results/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            const updatedList = response.data.resultats.map(item => ({
                url: `http://localhost:5000/${item.url}`
            }));
            setPredictionListe(updatedList);
        } catch (error) {
            console.error('Error while fetching predictions:', error);
            setError('Error while fetching predictions');
        }
    };

    const fetchImages = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/dl_routes/projects/${id}/imported-files`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                withCredentials: true,
            });
            const urls = response.data.map(image => `http://localhost:5000${image.url}`);
            setImageUrls(urls);
        } catch (error) {
            console.error('Error while fetching imported files:', error);
        }
    };

    const handlePredictedSlices = () => {
        fetchPredictions();
        fetchImages();
        setShowDownloadButton(true); // Afficher le bouton "Download" après l'affichage des résultats
    };

    const downloadImages = async () => {
        const zip = new JSZip();
        const imgFolder = zip.folder("images");

        // Télécharger les images originales
       // Télécharger les images originales
const originalImageNames = []; // To store the original image names

for (const url of imageUrls) {
    const response = await fetch(url);
    const blob = await response.blob();
    const originalName = `original_${url.split('/').pop()}`;
    imgFolder.file(originalName, blob);
    originalImageNames.push(originalName); // Store the original names
}

// Télécharger les images prédites
for (let i = 0; i < predictionListe.length; i++) {
    const result = predictionListe[i];

    // Assume the order of predicted images matches the order of original images in the array
    if (i < originalImageNames.length) {
        const predictedImageName = `predicted_${originalImageNames[i].replace('original_', '')}`;

        try {
            const response = await fetch(result.url);
            if (!response.ok) {
                throw new Error(`Failed to fetch predicted image from ${result.url}: ${response.statusText}`);
            }
            const blob = await response.blob();
            imgFolder.file(predictedImageName, blob);
            console.log(`Downloaded: ${predictedImageName}`);
        } catch (error) {
            console.error(error);
        }
    } else {
        console.warn(`No original image available for predicted image index: ${i}`);
    }
}

        // Générer le fichier zip et le télécharger
        zip.generateAsync({ type: "blob" }).then((content) => {
            saveAs(content, "images_and_predictions.zip");
            alert('Téléchargement des images réussi !'); // Afficher l'alerte de succès

        });
    };

    return (
        <div className="container">
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
                <h2>Inception V1 - Model Details</h2>
                <p>Here you can view your model results related to Inception V1.</p>
                <button onClick={handlePredictedSlices}>View results</button>
                {error && <p className="error-message">{error}</p>}
                {imageUrls.length > 0 && predictionListe.length > 0 && (
                    <div className="images-container">
                        <div className="images-section">
                            <h3>Original Images</h3>
                            <div className="image-gallery">
                                {imageUrls.slice(0, predictionListe.length).map((url, index) => (
                                    <img key={index} src={url} alt={`Original ${index + 1}`} className="image-original" />
                                ))}
                            </div>
                        </div>
                        <div className="images-section">
                            <h3>Predicted Images</h3>
                            <div className="image-gallery">
                                {predictionListe.map((result, index) => (
                                    <img key={index} src={result.url} alt={`Predicted ${index + 1}`} className="image-predicted" />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {imageUrls.length === 0 && <p>No images imported yet.</p>}
                
                {/* Affichage conditionnel du bouton "Download" */}
                {showDownloadButton && (
                    <button onClick={downloadImages} className="download-button">Download Images</button>
                )}
            </div>
        </div>
    );
};

export default InceptionV1;
