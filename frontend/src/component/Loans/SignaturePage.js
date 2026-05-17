import React, { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrash, faUndo, faRedo, faSave, faCamera, faDownload } from '@fortawesome/free-solid-svg-icons';

import '../../style/loans/loan-profile.css';
import '../../style/loans/signature-page.css';


const SignaturePage = () => {
  const sigCanvas = useRef();
  const { customerID } = useParams();
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const navigate = useNavigate();
  

  const saveState = () => {
    const currentData = sigCanvas.current.toDataURL();
    if (!history.length || history[history.length - 1] !== currentData) {
      setHistory([...history, currentData]);
      setRedoStack([]); // Clear redo stack on new changes
    }
  };

  // const handleSaveSignature = async () => {
  //   const dataURL = sigCanvas.current.toDataURL('image/png');
  //   const blob = await (await fetch(dataURL)).blob(); // Convert to Blob
  //   const formData = new FormData();
  //   formData.append('attachments', blob, 'signature.png'); // Mimic a file upload

  //   try {
  //     const token = localStorage.getItem('token');

  //     await axios.post(`https://foilar-test24.onrender.com/api/loan-profile/${customerID}/signature`, formData,{
  //       headers: { 'x-auth-token': token }});
  //     alert('Signature saved successfully.');

  //     sigCanvas.current.clear();

  //   setHistory([]);
  //   setRedoStack([]);
      
  //   } catch (error) {
  //     console.error('Error saving signature:', error.message);
  //   }
  // };

  
  const handleSaveSignature = async () => {
    if (sigCanvas.current.isEmpty()) {
        alert("Please provide a signature before saving.");
        return;
    }

    const dataURL = sigCanvas.current.toDataURL('image/png');
    const blob = await (await fetch(dataURL)).blob();
    const formData = new FormData();
    formData.append('image', blob, 'signature.png'); // The key MUST match backend

    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/signature/upload/${customerID}`, {
            method: 'POST',
            headers: {
                'x-auth-token': token // Don't set 'Content-Type': 'multipart/form-data' (handled automatically)
            },
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            alert("Signature saved successfully.");
            sigCanvas.current.clear();
        } else {
            alert(result.error || "Failed to save signature.");
        }

    } catch (error) {
        console.error("Error saving signature:", error);
        alert("Error saving signature.");
    }
};

  const handlehome = () => {
    navigate(`/DetailPage/${customerID}`);
  };

  const handleAddImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const ctx = sigCanvas.current.getCanvas().getContext('2d');
          ctx.drawImage(img, 0, 0, sigCanvas.current.getCanvas().width, sigCanvas.current.getCanvas().height);
          saveState(); // Save state after adding image
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureImage = async () => {
    const video = document.createElement('video');
    video.style.display = 'none';
    document.body.appendChild(video);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      video.play();

      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = 500; // Adjust width/height as needed
      captureCanvas.height = 300;

      setTimeout(() => {
        const ctx = captureCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

        const img = new Image();
        img.onload = () => {
          const ctx = sigCanvas.current.getCanvas().getContext('2d');
          ctx.drawImage(img, 0, 0, sigCanvas.current.getCanvas().width, sigCanvas.current.getCanvas().height);
          saveState(); // Save state after capturing image
        };
        img.src = captureCanvas.toDataURL();

        stream.getTracks().forEach((track) => track.stop());
        video.remove();
      }, 1000); // Capture after 1 second
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = 'signature.png';
    link.href = sigCanvas.current.toDataURL('image/png');
    link.click();
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const lastState = history[history.length - 2];
      console.log('Undoing to state:', lastState);
      setRedoStack((prev) => [history[history.length - 1], ...prev]);
      setHistory((prev) => prev.slice(0, -1));

      const ctx = sigCanvas.current.getCanvas().getContext('2d');
      ctx.clearRect(0, 0, sigCanvas.current.getCanvas().width, sigCanvas.current.getCanvas().height);

      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = lastState;
    } else {
      console.log('No states to undo.');
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[0];
      console.log('Redoing to state:', nextState);
      setRedoStack((prev) => prev.slice(1));
      setHistory((prev) => [...prev, nextState]);

      const ctx = sigCanvas.current.getCanvas().getContext('2d');
      ctx.clearRect(0, 0, sigCanvas.current.getCanvas().width, sigCanvas.current.getCanvas().height);

      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = nextState;
    } else {
      console.log('No states to redo.');
    }
  };

  useEffect(() => {
    saveState(); // Save initial state on mount
  }, []);


  return (
    <div className="signature-c">
    <div className="heading">
      <span onClick={() => handlehome()}>
        <FontAwesomeIcon icon={faArrowLeft} size="lg" />
      </span>
      Signature Page
    </div>
    
      <div className="signature-container">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
          onEnd={saveState}
        />
        <div className="signature-buttons">
          <button className="clear" onClick={() => sigCanvas.current.clear()}>
            <FontAwesomeIcon icon={faTrash} /> Clear
          </button>
          <button className="undo" onClick={handleUndo}>
            <FontAwesomeIcon icon={faUndo} /> Undo
          </button>
          <button className="redo" onClick={handleRedo}>
            <FontAwesomeIcon icon={faRedo} /> Redo
          </button>
          <button className="save" onClick={handleSaveSignature}>
            <FontAwesomeIcon icon={faSave} /> Save
          </button>
          <label>
            <FontAwesomeIcon icon={faCamera} /> Upload
            <input type="file" accept="image/*" onChange={handleAddImage} />
          </label>
          <button className="capture" onClick={handleCaptureImage}>
            <FontAwesomeIcon icon={faCamera} /> Capture
          </button>
          <button className="download" onClick={handleDownload}>
            <FontAwesomeIcon icon={faDownload} /> Download
          </button>
        </div>
        </div>

    </div>
  );
  
};

export default SignaturePage;
