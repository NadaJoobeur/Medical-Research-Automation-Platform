import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../../assets/DLcss/Processing.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faDatabase, faChartLine, faCog, faBrain, faArrowsAlt, faCut ,faHistory, faFileAlt} from '@fortawesome/free-solid-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faRocket } from '@fortawesome/free-solid-svg-icons';

const ProcessingDL = () => {
  const [normalizedImages, setNormalizedImages] = useState([]);
  const [showNormalizationOptions, setShowNormalizationOptions] = useState(false);
  const [selectedNormalization, setSelectedNormalization] = useState(null);
  const [normalizationStatus, setNormalizationStatus] = useState(null);
  
  
  const [dimensionVariation, setDimensionVariation] = useState('');
  const [imageCount, setImageCount] = useState(0);
  const { id, dimensionRanges, nbr,encodedUrl, fileId } = useParams();
  const navigate = useNavigate();
  const [resizedImages, setResizedImages] = useState([]);
  const [slicedImages, setSlicedImages] = useState([]);
  const [fnct, setFnct] = useState('');
  const [nbrIm,setNbr]=useState(0);
  const [width, setWidth] = useState(256);  // Valeur par défaut 256
  const [height, setHeight] = useState(256); // Valeur par défaut 256
  const [slice_x,setslice_x] = useState(2); // Valeur par défaut 2
  const [slice_y,setslice_y] = useState(2); // Valeur par défaut 2
  const [resizeStatus, setResizeStatus] = useState('');
  const [resizedImagesCount, setResizedImagesCount] = useState(0);
  const [sliceInfo, setSliceInfo] = useState(null);
  const [urls, setUrls] = useState([]);
  const [normalized,setnormalized]= useState('');
  const [sliced,setsliced]= useState('');
  const [resized,setresized]= useState('');
  const [treated,settreated]= useState('');
  const [dimensionRangeBeforeResize, setDimensionRangeBeforeResize] = useState({
    min_dimensions: [],
    max_dimensions: []}); 
  const [min_dimensions, setminDimensions] = useState([]);
  const [max_dimensions, setmaxDimensions] = useState([]);
  const[last_size,setlastSize]=useState('')
  const [showTooltip, setShowTooltip] = useState(false); // État pour afficher le cadre
  const handleMouseEnter = () => {
    setShowTooltip(true); // Afficher le cadre au survol
  };
  const handleMouseLeave = () => {
    setShowTooltip(false); // Masquer le cadre lorsque le curseur quitte le bouton
  };

  const handleSave = async () => {
    
    console.log("normalized:",normalized)

    try {
      const response = await fetch(`http://localhost:5000/dl_routes/save-data/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: urls,
          normalized: normalized,
          resized: resized,
          sliced: sliced,
          
          fileId:fileId
        }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();  // Read error details from the response
        throw new Error(`Network response was not ok. ${errorText}`);
      }
      console.log('fileIdd:',fileId)
      const result = await response.json();
      console.log('Success:', result);
      // Définir le message d'alerte de succès
      alert('Votre data est sauvegardé avec succès');
    } catch (error) {
      console.error('Error:', error);
      // Définir le message d'alerte d'erreur
      alert('Une erreur est déclenchée, il faut prétraiter vos données d’abord !');
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };
  const handleDBClick = () => {
    navigate(`/importSuccDL/${id}`);
  };
  const handleGraphsClick = () => {
    console.log("Nbr value:", nbr); // Vérifie la valeur de nbr
    navigate(`/graphsDL/${id}/${nbr}`);
  };
  const handleProcessingClick = () => {
    navigate(`/processingDL/${id}/${nbr}`);
  };
  const handleHistorique = () => {
    navigate(`/historyDL/${id}/${nbr}`);
};
  const handleModelsClick = () => {
    const encodedImages = encodeURIComponent(JSON.stringify(slicedImages));
    navigate(`/modelsDL/${id}/${encodedImages}`);
  };
  const handleDepClick = () => {
    navigate(`/readMe/${id}`);
  };
  const handleNormalizationClick = () => {
    setShowNormalizationOptions(!showNormalizationOptions);
  };
  const handleNormalizationSelect = async (technique) => {
    setSelectedNormalization(technique);
    setShowNormalizationOptions(false);
   
    if (!id) {
      alert('Please enter a patient ID');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      alert('User is not authenticated');
      return;
    }
   
    try {
      const response = await axios.post(
        `http://localhost:5000/dl_routes/normalize_stored/${id}`,
        { normalization_method: technique ,last_fnct:fnct,nbrIm:nbrIm,treated_img:treated},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("Bonjour",response.data)
      setNormalizationStatus(response.data.normalizationStatus);
      setImageCount(response.data.normalizedImagesCount);
      setDimensionVariation(response.data.dimensionVariation);
      setNormalizedImages(response.data.normalizedImages);
      setFnct("normalization")
      setNbr(response.data.normalizedImagesCount)
      setlastSize(response.data.dimensionVariation)
      setUrls(response.data.urls)
      const normalized = ` nbr Img: ${response.data.normalizedImagesCount} - Dimensions : ${response.data.dimensionVariation} - Technique : ${technique}`;
      setnormalized(normalized);

      
      
      

      
      } catch (error) {
      console.error('Error normalizing stored images:', error);
      alert('Error normalizing images');
    }
  };

  const handleResizingClick = async () => {
    if (!id) {
      alert('Please enter a patient ID');
      return;
    }
  
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('User is not authenticated');
      return;
    }
  
    try {
      const response = await axios.post(
        `http://localhost:5000/dl_routes/resize_stored/${id}`,
        { last_fnct: fnct, longueur: height, largeur: width ,nbrIm:nbrIm,treated_img:treated},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setResizeStatus(response.data.status);
      setResizedImagesCount(response.data.numberOfImagesResized);
      setDimensionRangeBeforeResize({
        max_dimensions: response.data.dimensionRangeBeforeResize.max_dimensions,
        min_dimensions: response.data.dimensionRangeBeforeResize.min_dimensions
      });
      setmaxDimensions(response.data.dimensionRangeBeforeResize.max_dimensions)
      setminDimensions( response.data.dimensionRangeBeforeResize.min_dimensions)
      setUrls(response.data.urls)


      console.log("DimensionRangeBeforeResize",dimensionRangeBeforeResize)
      alert('Images resized successfully');
      setFnct('resizing');
      setNbr(response.data.numberOfImagesResized);
      setlastSize(`${height}x${width}`)
      const resized = `Nbr Img : ${response.data.numberOfImagesResized} - Dimensions Before : ${response.data.dimensionRangeBeforeResize.max_dimensions[0]}_${response.data.dimensionRangeBeforeResize.min_dimensions[0]} - Dimensions After :${height}, ${width} `;
      setresized(resized);
    } catch (error) {
      console.error('Error resizing stored images: Normalize First pls !!!', error);
      alert('Error resizing stored images: Normalize First pls !!!');
    }
  };
  
  const handleSlicingClick = async () => {
    if (!id) {
      alert('Patient ID is missing');
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      alert('User is not authenticated');
      return;
    }
   
    try {
      const response = await axios.post(
        `http://localhost:5000/dl_routes/slice-image/${id}`,
        {last_fnct:fnct,slice_x:slice_x,slice_y:slice_y,nbrIm:nbrIm,treated_img:treated},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setSlicedImages(response.data.slicedImages);
      setSliceInfo({
        totalSlices: response.data.totalSlices,
        dimensionsBefore: response.data.dimensionsBefore,
        dimensionsAfter: response.data.dimensionsAfter
    });
      alert('Images sliced successfully');
      setFnct("slicing");
      setNbr(response.data.slicedImages);
      setUrls(response.data.urls)
      const dimensionsAfter = response.data.dimensionsAfter;

      const sliced = `slice nbr :${response.data.totalSlices} - Dimensions Before : ${response.data.dimensionsBefore} - Dimensions After : height: ${dimensionsAfter.height}, width: ${dimensionsAfter.width}`;
      setsliced(sliced);
      
    } catch (error) {
      console.error('Error slicing stored images:', error);
      alert('Error slicing images');
    }
  };
  useEffect(() => {
    if (nbr) {
        setNbr(parseInt(nbr, 10));
    }
    setlastSize(decodeURIComponent(dimensionRanges))
    console.log("id:", id);
    console.log("nbr:", nbr);
    console.log("decodedDimensionRanges:", decodeURIComponent(dimensionRanges));
    console.log("encodeurl:",  encodedUrl);
    settreated( encodedUrl)
    console.log("treated:", treated);
    console.log("fileId:",fileId);
    }, [id, dimensionRanges, nbr,treated,fileId]);


  const tooltipStyle = {
    position: 'relative',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '5px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    zIndex: 1
  };
  return (
    <div>
      <div className="menu-bar">
        {/* Navigation Menu */}
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

      <div className='content1'>
        <div className="processing-title">
          <h2>Image Processing</h2>
        </div>


        <div className="processing-buttons">
  {/* Normalization Section */}
  <div className="normalization-container ">
    <button className="large-button" id='btnnr' onClick={handleNormalizationClick}>
      <FontAwesomeIcon icon={faCog} />
      <span>Normalization</span>
    </button>

    <div className={`normalization-options ${showNormalizationOptions ? 'show' : ''}`}>
      <button onClick={() => handleNormalizationSelect('min-max')}>Min-Max Normalization</button>
      <button onClick={() => handleNormalizationSelect('z-score')}>Z-Score Normalization</button>
      <button onClick={() => handleNormalizationSelect('channelwise')}>Channelwise Normalization</button>
    </div>
  </div>

  {/* Resizing Section */}
  <div className="resizing-container">
  <button className="large-button" onClick={handleResizingClick}>
    <FontAwesomeIcon icon={faArrowsAlt} size="2x" />
    <span>Resize Images</span>
  </button>
  <div className="resizing-inputs">
    <label>
      height
      <input
        type="number"
        value={width}
        onChange={(e) => setWidth(e.target.value)}
        placeholder="Entrer la largeur"
      />
    </label>
    <label>
      width
      <input
        type="number"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        placeholder="Entrer la hauteur"
      />
    </label>
  </div>
</div>


  {/* Slicing Section */}
  <div className="slicing-container">
    <button
      className="large-button"
      onClick={handleSlicingClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <FontAwesomeIcon icon={faCut} size="2x" />
      <span>Slice Images</span>
    </button>
    <div className="slicing-inputs">
      <label>
       patchExtraction_x
        <input
          type="number"
          value={slice_x}
          onChange={(e) => setslice_x(e.target.value)}
          placeholder="input the number of slices"
        />
      </label>
      <label>
      patchExtraction_y
        <input
          type="number"
          value={slice_y}
          onChange={(e) => setslice_y(e.target.value)}
          placeholder="input the number of slices"
        />
      </label>
    </div>

    {/* Tooltip */}
    {showTooltip && (
      <div className="tooltip" style={tooltipStyle}>
        <p>Image Size: {last_size}</p>
      </div>
    )}
  </div>
</div>



    <div className='resultat'>
    {normalizationStatus && (
              <div className="normalization-status">
                <h3>Normalization Status</h3>
                <p>Status: {normalizationStatus}</p>
                <p>Number of Normalized Images: {imageCount}</p>
                <p>Dimension Variation: {dimensionVariation}</p>
                <p>Technique Used: {selectedNormalization}</p>
              </div>
            )}
              {resizeStatus && (
        <div className="resize-status">
          <h3>Resize Status</h3>
          <p>Status: {resizeStatus}</p>
          <p>Number of Images Resized: {resizedImagesCount}</p>
          <p>Image Dimension Before Resize: {min_dimensions[0]}x{max_dimensions[0]}</p>
          <p>Image Dimension After Resize: {height}x{width}</p>


         
        </div>
      )}
      {sliceInfo && (
            <div className="slice-status">
                <h3>Slice Status</h3>
                <p>Total Number of Slices: {sliceInfo.totalSlices}</p>
                <p>Image Dimension Before Slice: {Array.isArray(sliceInfo.dimensionsBefore) ? sliceInfo.dimensionsBefore.join('x') : sliceInfo.dimensionsBefore}</p>
                <p>Image Dimension After Slice: {sliceInfo.dimensionsAfter.height} x {sliceInfo.dimensionsAfter.width}</p>
  </div>
            
        )}

    </div>
    <button onClick={handleSave}><FontAwesomeIcon icon={faDownload}></FontAwesomeIcon>save change</button>
   
    </div>
    
    </div>

  );
  
};

export default ProcessingDL;
