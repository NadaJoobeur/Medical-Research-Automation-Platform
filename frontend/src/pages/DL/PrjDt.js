import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/ProjectDetail.css';
import { faRocket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProjectDetailDL = () => {
  const navigate = useNavigate();
  const { id, name } = useParams(); // `name` contient le nom du projet
  const fileInputRef = useRef(null);
  const imagePreviewRef = useRef(null);
  const [folderName, setFolderName] = useState('');

  useEffect(() => {
    // Check if a file has been imported for this project ID
    const importedFolderName = localStorage.getItem(`importedFolderName_${id}`);
    if (importedFolderName) {
      setFolderName(importedFolderName);
    }
  }, [id]);

  const handleBackClick = () => {
    navigate('/profile');
  };
  const handleDepClick = () => {
    navigate(`/readMe/${id}`);
  };
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);

    if (selectedFiles.length > 0) {
      // Extraire le nom du dossier à partir du chemin du premier fichier
      const folderName = selectedFiles[0].webkitRelativePath.split('/')[0];
      setFolderName(folderName);
      localStorage.setItem(`importedFolderName_${id}`, folderName);

      if (imagePreviewRef.current) {
        imagePreviewRef.current.innerHTML = ''; // Réinitialiser la prévisualisation
        selectedFiles.forEach(async (file) => {
          const fileType = file.type;
          const reader = new FileReader();

          // Vérifie si le fichier est une image
          if (fileType.startsWith('image/')) {
            reader.onload = async (e) => {
              const fileContent = e.target.result;
              const img = document.createElement('img');
              img.src = fileContent;
              img.style.width = '100px'; // Ajuster la taille selon vos besoins
              img.style.margin = '5px'; // Ajouter un peu d'espace entre les images

              // Ajouter l'image à l'élément de prévisualisation
              if (imagePreviewRef.current) {
                imagePreviewRef.current.appendChild(img);
              }

              // Envoi de l'image au serveur
              await saveDatabase(file);
            };

            reader.readAsDataURL(file);
          } else {
            alert('Please select only image files.');
          }
        });
      }
    } else {
      alert('No files selected.');
    }
  };

  const saveDatabase = async (file) => {
    const formData = new FormData();
    formData.append('database', file); // Ajout du fichier au FormData

    const token = localStorage.getItem('token'); // Récupérez le token depuis localStorage

    try {
      // Envoyer le fichier au serveur
      await axios.post(`http://localhost:5000/dl_routes/import-database/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Type de contenu pour les fichiers
          'Authorization': `Bearer ${token}`, // Ajoutez le token ici
        },
        withCredentials: true, // Assurez-vous que les cookies sont envoyés avec la requête
      });

      console.log('Image file saved successfully');
    } catch (error) {
      console.error('Error saving the image file:', error);
    }
  };

  const handleGoToMenuClick = () => {
    navigate(`/importSuccDL/${id}`);
  };

  return (
    <div className="project-detail">
      <header className="header">
        <button className="back-button" onClick={handleBackClick}>
          Back
        </button>
        <div className="app-name1">
          <img src="/lg.png" alt="App Icon" className="app-icon" />
          <span>MedicalVision</span>
        </div>
      </header>
      <div className="project-info">
      <img src="/image/dl.jpg" alt="Project" className="project-image" />
        <div className="project-details">
          <h1>Project Name: {decodeURIComponent(name)}</h1>
          <p>Selected Folder: {folderName || 'No folder selected'}</p>
        </div>
      </div>
      {folderName && (
        <button className="import-button" onClick={handleGoToMenuClick}>
          Upload
        </button>
      )}
      {!folderName && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            webkitdirectory="true" // Permet la sélection d'un dossier
            style={{ display: 'none' }}
          />

          <button className="import-button" onClick={handleImportClick}>
            Import Your Images
          </button>
          <div
            ref={imagePreviewRef}
            style={{ display: 'flex', flexWrap: 'wrap', maxWidth: '100%', maxHeight: '400px' }}
          />
        </>
      )}
    </div>
  );
};

export default ProjectDetailDL;
