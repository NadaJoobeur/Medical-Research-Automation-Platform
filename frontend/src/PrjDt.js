import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import axios from 'axios';
import '../assets/css/ProjectDetail.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faBars, faUpload } from '@fortawesome/free-solid-svg-icons'; 

const ProjectDetail = () => {
    const navigate = useNavigate();
    const { id, name } = useParams();
    const imagePreviewRef = useRef(null);
    const [folderName, setFolderName] = useState('');
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState(() => {
      return localStorage.getItem(`importedFileName_${id}`) || 'No file selected';
    });
    const [projectType, setProjectType] = useState(() => {
      return localStorage.getItem(`projectType_${id}`) || null;
    });
  
    useEffect(() => {
      const importedFileName = localStorage.getItem(`importedFileName_${id}`);
      if (importedFileName) {
        setFileName(importedFileName);
      }
    }, [id]);
  
    const handleBackClick = () => {
      navigate('/profile');
    };
  
    const handleImportClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };


    const handleFileChangeDL = async (event) => {
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
                await saveDatabaseDL(file);
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
  
    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        const fileType = selectedFile.type;
        const reader = new FileReader();
  
        reader.onload = (e) => {
          const fileContent = e.target.result;
          let data = [];
          let totalRows = 0;
          let totalColumns = 0;
  
          if (fileType === 'text/csv' || fileType === 'application/vnd.ms-excel') {
            Papa.parse(fileContent, {
              header: true,
              complete: (results) => {
                data = results.data.slice(0, 15);
                totalRows = results.data.length;
                totalColumns = results.meta.fields.length;
                saveDatabaseML(selectedFile, selectedFile.name);
              },
            });
          } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const workbook = XLSX.read(fileContent, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { header: 1 });
            data = worksheet.slice(1, 16);
            totalRows = worksheet.length - 1;
            totalColumns = worksheet[0].length;
            saveDatabaseML(selectedFile, selectedFile.name);
          }
        };
  
        if (fileType === 'text/csv' || fileType === 'application/vnd.ms-excel') {
          reader.readAsText(selectedFile);
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          reader.readAsBinaryString(selectedFile);
        }
  
        setFileName(selectedFile.name);
        localStorage.setItem(`importedFileName_${id}`, selectedFile.name);
      } else {
        alert('Please select a valid CSV or Excel file.');
      }
    };
      
  
    const saveDatabaseML = async (files, fileName) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('database', file); // Ajouter chaque fichier à formData
      });
      const token = localStorage.getItem('token');
      try {
        await axios.post(`http://localhost:5000/file/import-database/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true,
        });
        console.log('Database saved successfully');
      } catch (error) {
        console.error('Error saving the database:', error);
      }
    };
    const saveDatabaseDL = async (files, fileName) => {
        const formData = new FormData();
        Array.from(files).forEach(file => {
          formData.append('database', file); // Ajouter chaque fichier à formData
        });
        const token = localStorage.getItem('token');
        try {
          await axios.post(`http://localhost:5000/file/import-databaseDL/${id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            },
            withCredentials: true,
          });
          console.log('Database saved successfully');
        } catch (error) {
          console.error('Error saving the database:', error);
        }
      };
  
    const handleGoToMenuClick = () => {
      const nextPage = projectType === 'ML' ? `/ml-page/${id}` : `/dl-page/${id}`;
      navigate(nextPage);  // Redirection en fonction du type de projet
    };
  
    return (
      <div className="project-detail">
        <header className="header">
          <button className="back-button" onClick={handleBackClick}>
            <FontAwesomeIcon icon={faChevronLeft} /> Back
          </button>
          <div className="app-name1">
            <img src="/lg.png" alt="App Icon" className="app-icon" />
            <span>MedicalVision</span>
          </div>
        </header>
        <div className="project-info">
          <img src="/image/a.jpg" alt="Project" className="project-image" />
          <div className="project-details">
            <h1>Project Name: {decodeURIComponent(name)}</h1>
            <p>Selected File: {fileName}</p>
            <p>Project Type: {projectType || 'Not selected yet'}</p>
          </div>
        </div>
        {fileName !== 'No file selected' && (
          <button className="import-button" onClick={handleGoToMenuClick}>
            <FontAwesomeIcon icon={faBars} /> Go to Menu
          </button>
        )}
        {fileName === 'No file selected' && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*, .csv, .xls, .xlsx"
              webkitdirectory
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button className="import-button" onClick={handleImportClick}>
              <FontAwesomeIcon icon={faUpload} /> Import Your Database
            </button>
          </>
        )}
      </div>
    );
  };
  
  export default ProjectDetail;
  
  
  