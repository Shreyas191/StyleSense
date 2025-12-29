import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

const ImageUpload = ({ onImageSelect, selectedImage, onClear }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    } else {
      alert('Please upload an image file (JPG, JPEG, or PNG)');
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input ref={inputRef} type="file" className="hidden" accept="image/jpeg,image/jpg,image/png" onChange={handleChange} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">Drop your outfit image here</p>
          <p className="text-sm text-gray-500">or click to browse (JPG, JPEG, PNG - Max 5MB)</p>
        </div>
      ) : (
        <div className="relative">
          <img src={URL.createObjectURL(selectedImage)} alt="Selected outfit" className="w-full h-96 object-cover rounded-xl" />
          <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
