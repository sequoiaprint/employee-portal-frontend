import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, Upload, File, Folder, ChevronRight, ChevronDown, Loader } from 'lucide-react';

const BulkConverter = () => {
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [response, setResponse] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [uploadStep, setUploadStep] = useState(null); // 'uploading' or 'converting'

  const onDrop = useCallback(async (acceptedFiles) => {
    const aiFiles = acceptedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.ai')
    );

    if (aiFiles.length === 0) {
      alert('Please select AI files only');
      return;
    }

    if (aiFiles.length > 20) {
      alert('Maximum 20 files allowed');
      return;
    }

    await processFiles(aiFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/illustrator': ['.ai']
    },
    maxFiles: 20
  });

  const processFiles = async (files) => {
    try {
      // Step 1: Get presigned URLs from server
      setUploadStep('generating-urls');
      setUploading(true);
      setUploadProgress({ current: 0, total: files.length });

      const fileNames = files.map(f => f.name);
      
      const urlResponse = await fetch('https://convert.sequoia-print.com/generate-upload-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileNames }),
      });

      const urlResult = await urlResponse.json();
      
      if (!urlResult.success) {
        throw new Error(urlResult.message || 'Failed to get upload URLs');
      }

      // Step 2: Upload files directly to S3
      setUploadStep('uploading');
      const uploadUrls = urlResult.urls;
      const uploadResults = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { uploadUrl, s3Key, fileName } = uploadUrls[i];

        try {
          setUploadProgress({ current: i + 1, total: files.length });

          const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': 'application/postscript',
            },
          });

          if (!uploadResponse.ok) {
            throw new Error(`Upload failed: ${uploadResponse.statusText}`);
          }

          uploadResults.push({
            fileName,
            s3Key,
            status: 'success',
          });

          console.log(`✅ Uploaded: ${fileName}`);

        } catch (error) {
          console.error(`❌ Upload failed for ${fileName}:`, error);
          
          uploadResults.push({
            fileName,
            s3Key: '',
            status: 'failed',
            error: error.message,
          });
        }
      }

      const successfulUploads = uploadResults.filter(r => r.status === 'success');
      
      if (successfulUploads.length === 0) {
        throw new Error('No files were successfully uploaded');
      }

      // Step 3: Trigger S3-to-S3 conversion
      setUploadStep('converting');
      setUploading(false);
      setConverting(true);

      const s3Keys = successfulUploads.map(r => r.s3Key);
      
      const convertResponse = await fetch('https://convert.sequoia-print.com/convert-s3-files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          s3Keys: s3Keys.join(',') // Send as comma-separated string
        }),
      });

      const convertResult = await convertResponse.json();
      
      if (!convertResult.success) {
        throw new Error(convertResult.message || 'Conversion failed');
      }

      setResponse(convertResult);

    } catch (error) {
      console.error('Processing failed:', error);
      alert(`Processing failed: ${error.message}`);
    } finally {
      setUploading(false);
      setConverting(false);
      setUploadStep(null);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const formatFileStructure = () => {
    if (!response?.details) return null;

    const structure = {};

    response.details.forEach(item => {
      if (item.status === 'completed') {
        const folderParts = item.folderKey.split('/');
        const timestamp = folderParts[1];
        const folderName = folderParts[2];
        
        if (!structure[timestamp]) {
          structure[timestamp] = {};
        }
        
        structure[timestamp][folderName] = {
          originalFile: item.originalKey ? item.originalKey.split('/').pop() : 'Unknown',
          jpgCount: item.jpgCount,
          jpgs: Array.from({ length: item.jpgCount }, (_, i) => 
            `${folderName}-${(i + 1).toString().padStart(2, '0')}.jpg`
          )
        };
      }
    });

    return structure;
  };

  const renderFileTree = (structure) => {
    return Object.entries(structure).map(([timestamp, folders]) => (
      <div key={timestamp} className="ml-4">
        <div className="flex items-center text-gray-700 font-medium py-1">
          <Folder size={16} className="mr-2" />
          conversions/
          <span className="text-blue-600 ml-1">{timestamp}</span>
        </div>
        {Object.entries(folders).map(([folderName, folderData]) => (
          <div key={folderName} className="ml-6">
            <div 
              className="flex items-center py-1 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleFolder(`${timestamp}/${folderName}`)}
            >
              {expandedFolders.has(`${timestamp}/${folderName}`) ? (
                <ChevronDown size={16} className="mr-1" />
              ) : (
                <ChevronRight size={16} className="mr-1" />
              )}
              <Folder size={16} className="mr-2 text-blue-500" />
              <span className="font-medium">{folderName}</span>
              <span className="ml-2 text-sm text-gray-500">
                ({folderData.jpgCount} JPGs)
              </span>
            </div>
            
            {expandedFolders.has(`${timestamp}/${folderName}`) && (
              <div className="ml-6">
                <div className="flex items-center text-sm text-gray-600 py-1">
                  <File size={14} className="mr-2" />
                  <span className="font-mono">{folderData.originalFile}</span>
                  <span className="ml-2 text-xs text-gray-400">(original - deleted after conversion)</span>
                </div>
                {folderData.jpgs.map((jpg, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-500 py-1 ml-4">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                    <File size={12} className="mr-2" />
                    {jpg}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    ));
  };

  const getStatusMessage = () => {
    if (uploadStep === 'generating-urls') {
      return "Preparing upload links...";
    } else if (uploadStep === 'uploading') {
      return `Uploading files directly to cloud storage... (${uploadProgress.current}/${uploadProgress.total})`;
    } else if (uploadStep === 'converting') {
      return "Converting AI files to JPG format... This may take a while.";
    }
    return "";
  };

  const fileStructure = formatFileStructure();

  return (
    <div className="p-12 max-w-6xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Bulk AI to JPG Converter</h1>
      <p className="text-gray-600 mb-8">Convert up to 20 AI files to JPG format with direct cloud upload</p>

      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive || dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-orange-600 bg-orange-50 hover:bg-orange-100'
        }`}
        onDragOver={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
      >
        <input {...getInputProps()} />
        <Upload size={48} className="mx-auto mb-4 text-orange-600" />
        {isDragActive ? (
          <p className="text-lg text-blue-600">Drop the AI files here...</p>
        ) : (
          <div>
            <p className="text-lg text-gray-700 mb-2">
              Drag & drop AI files here, or click to select
            </p>
            <p className="text-sm text-gray-500">
              Maximum 20 files • AI format only • Direct cloud upload (faster!)
            </p>
          </div>
        )}
      </div>

      {/* Upload/Conversion Progress */}
      {(uploading || converting) && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Loader size={24} className="animate-spin mr-3 text-blue-600" />
            <span className="text-blue-700 font-medium">{getStatusMessage()}</span>
          </div>
          {uploadStep === 'uploading' && (
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {response && (
        <div className="mt-8 space-y-6">
          {/* Download Section */}
          {response.downloadUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-green-800 mb-1">
                    ✅ Conversion Complete!
                  </h3>
                  <p className="text-green-600">
                    Successfully processed {response.successful} out of {response.totalFiles} file{response.totalFiles > 1 ? 's' : ''}
                    {response.failed > 0 && (
                      <span className="text-orange-600 ml-2">
                        ({response.failed} failed)
                      </span>
                    )}
                  </p>
                  {response.cleanup && (
                    <p className="text-sm text-green-500 mt-1">
                      🧹 Cleaned up {response.cleanup.originalFilesDeleted} original files and {response.cleanup.conversionFoldersDeleted} temp folders
                    </p>
                  )}
                </div>
                <a
                  href={response.downloadUrl}
                  download
                  className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg"
                >
                  <Download size={20} className="mr-2" />
                  Download ZIP
                </a>
              </div>
            </div>
          )}

          {/* File Structure */}
          {fileStructure && Object.keys(fileStructure).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Folder className="mr-2" size={20} />
                File Structure (in ZIP)
              </h3>
              <div className="font-mono text-sm bg-gray-50 rounded p-4 text-left">
                {renderFileTree(fileStructure)}
              </div>
            </div>
          )}

          {/* Detailed Results */}
          {response.details && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-left">
                Conversion Details
              </h3>
              <div className="space-y-2">
                {response.details.map((detail, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded border ${
                      detail.status === 'completed' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-left">
                        {detail.originalKey ? detail.originalKey.split('/').pop() : 'Unknown'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        detail.status === 'completed' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {detail.status === 'completed' 
                          ? `✅ ${detail.jpgCount} JPGs` 
                          : `❌ Failed`}
                      </span>
                    </div>
                    {detail.error && (
                      <p className="text-red-600 text-sm mt-1 text-left">{detail.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {response && !response.success && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">❌ Error: {response.message}</p>
        </div>
      )}

      
    </div>
  );
};

export default BulkConverter;