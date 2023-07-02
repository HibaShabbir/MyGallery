import { useState, useEffect } from 'react';
import axios from 'axios';

export function Gallery() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  useEffect(() => {
    axios.get('http://localhost:3001/images').then(res => {
      setImages(res.data.images);
      console.log(res.data.images)
    });
  }, []);

  const handleFileSelect = e => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
  const formData = new FormData();
  formData.append('image', selectedFile);
  try {
    const res = await axios.post('http://localhost:3001/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    setImages([...images, res.data.url]);
    setSelectedFile(null);
  } catch (err) {
    console.log(err);
  }
  };

  const handleDelete = async filename => {
    try {
      await axios.delete(`http://localhost:3001/images/${filename}`);
      setImages(images.filter(image => !image.endsWith(filename)));
    } catch (err) {
      console.log(err);
    }
  }
    return (
      <div style={{ display: 'flex' , flexDirection:'row' }}>
        <div id ='col1' style={{flex:'60%'}}>
            <h1>Image gallery </h1>
            {images.map(imageUrl => (
            <div key={imageUrl}>
            <img src={imageUrl} alt="Uploaded" />
            <button onClick={() => handleDelete(imageUrl.split('/').pop())}>
            Delete
            </button>
            </div>
            ))}
        </div>
        <div id='col2'style={{flex:'40%'}}>
            <h1>Upload Image</h1>
            <h4>Please fill out the following form and press the upload button </h4>
            <input type="file" accept="image/*" onChange={handleFileSelect} />
            <button onClick={handleUpload} disabled={!selectedFile}>
            Upload
            </button>
        </div>
      </div>
     );}