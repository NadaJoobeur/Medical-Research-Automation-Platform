import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChartLine, faCog, faBrain, faDatabase,faHistory,faFileAlt } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import '../../assets/DLcss/graphs.css'; // Make sure you have the correct styles
import { faRocket } from '@fortawesome/free-solid-svg-icons';
const GraphsDL = () => {
  const navigate = useNavigate();
  const { id,nbr} = useParams();
  const [images, setImages] = useState([]);
  const [patientImageCounts, setPatientImageCounts] = useState({});
  const [dimensionRanges, setDimensionRanges] = useState({});

  const fetchImages = async () => {
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`http://localhost:5000/dl_routes/projects/${id}/imported-file-details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true,
      });

      const imageData = response.data;
      setImages(imageData);

      const counts = {};
      const dimensions = {};

      imageData.forEach(image => {
        const patientId = image.patient_id;
        counts[patientId] = (counts[patientId] || 0) + 1;
      
        // Calculate dimension range
        const [width, height] = image.dimensions.split('x').map(Number);
        if (!dimensions[patientId]) {
          dimensions[patientId] = { minWidth: width, maxWidth: width, minHeight: height, maxHeight: height };
        } else {
          dimensions[patientId].minWidth = Math.min(dimensions[patientId].minWidth, width);
          dimensions[patientId].maxWidth = Math.max(dimensions[patientId].maxWidth, width);
          dimensions[patientId].minHeight = Math.min(dimensions[patientId].minHeight, height);
          dimensions[patientId].maxHeight = Math.max(dimensions[patientId].maxHeight, height);
        }
      });

      setPatientImageCounts(counts);
      setDimensionRanges(dimensions);
    } catch (error) {
      console.error('Error fetching imported file details:', error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [id]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleGraphsClick = () => {
    navigate(`/graphsDL/${id}/${nbr}`);
  };
  const handleDepClick = () => {
    navigate(`/readMe/${id}`);
  };

  const handleProcessingClick = () => {
    const dimensionRangesString = JSON.stringify(dimensionRanges); // Sérialiser l'objet en chaîne
    navigate(`/processingDL/${id}/${nbr}/${encodeURIComponent(dimensionRangesString)}`); // Utiliser encodeURIComponent pour éviter des problèmes avec des caractères spéciaux
  };

  const handleModelsClick = () => {
    navigate(`/modelsDL/${id}`);
  };


  const handleDBClick = () => {
    navigate(`/importSuccDL/${id}`);
  };
  const handleHistorique = () => {
    navigate(`/historyDL/${id}/${nbr}`);
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
        <h2>Imported Images and Descriptions</h2>

        {Object.keys(patientImageCounts).map((patientId, index) => {
          const range = dimensionRanges[patientId];
          return (
            <div key={index}>
              <p><strong>Project:</strong> {patientImageCounts[patientId]} images</p>
              {range ? (
                <p><strong>Dimension Range:</strong> {range.minWidth}x{range.minHeight} - {range.maxWidth}x{range.maxHeight}</p>
              ) : (
                <p><strong>Dimension Range:</strong> N/A</p>
              )}
            </div>
          );
      })}

        {images.length > 0 ? (
          <div className="image-gallery">
            {images.map((image, index) => (
              <div key={index} className="image-container">
                <img src={`http://localhost:5000/dl_routes/uploads/${image.filename}`} alt={`Imported ${index}`} className="imported-image" />
                <div className="image-description">
                  <h3>Image {index + 1}</h3>
                  <p><strong>Filename:</strong> {image.filename}</p>
                  <p><strong>Dimensions:</strong> {image.dimensions}</p>
                  <p><strong>Number of Channels:</strong> {image.num_channels}</p>
                  <p><strong>Intensity Range:</strong> {image.intensity_range}</p>
                  <p><strong>File Size:</strong> {image.file_size !== undefined ? image.file_size.toFixed(2) : 'N/A'} MB</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No images imported yet.</p>
        )}
      </div>
    </>
  );
};

export default GraphsDL;
