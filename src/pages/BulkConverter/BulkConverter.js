import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, Upload, File, Folder, ChevronRight, ChevronDown, Loader } from 'lucide-react';

// Optimized settings
const CHUNK_SIZE = 15 * 1024 * 1024; // 15MB chunks
const MAX_CONCURRENT_UPLOADS = 5; // Increased from 3
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const BulkConverter = () => {
  const [uploading, setUploading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [response, setResponse] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ 
    current: 0, 
    total: 0, 
    speed: '0 MB/s',
    failedParts: 0,
    retrying: false
  });
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [dragOver, setDragOver] = useState(false);
  const [uploadStep, setUploadStep] = useState(null);

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

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadPartWithRetry = async (uploadUrl, chunk, partNumber, retryCount = 0) => {
    try {
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: chunk,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const etag = response.headers.get('ETag');
      if (!etag) {
        throw new Error('No ETag received from S3');
      }

      return {
        PartNumber: partNumber,
        ETag: etag.replace(/"/g, ''),
        success: true
      };
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Retrying part ${partNumber} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await delay(RETRY_DELAY * (retryCount + 1));
        return uploadPartWithRetry(uploadUrl, chunk, partNumber, retryCount + 1);
      } else {
        console.error(`Part ${partNumber} failed after ${MAX_RETRIES} retries:`, error);
        return {
          PartNumber: partNumber,
          success: false,
          error: error.message
        };
      }
    }
  };

  const uploadPartsParallel = async (file, urls, onProgress) => {
    const totalParts = urls.length;
    const successfulParts = [];
    let completedParts = 0;
    let failedParts = 0;
    const startTime = Date.now();
    let uploadedBytes = 0;

    for (let i = 0; i < totalParts; i += MAX_CONCURRENT_UPLOADS) {
      const batch = urls.slice(i, i + MAX_CONCURRENT_UPLOADS);
      
      const batchPromises = batch.map(async ({ partNumber, uploadUrl }) => {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const result = await uploadPartWithRetry(uploadUrl, chunk, partNumber);
        
        completedParts++;
        uploadedBytes += chunk.size;
        
  const elapsedTime = (Date.now() - startTime) / 1000;
        const speed = elapsedTime > 0 ? (uploadedBytes / elapsedTime / 1024 / 1024).toFixed(2) : '0';
        
        if (!result.success) {
          failedParts++;
          onProgress(completedParts, totalParts, failedParts, false, speed);
        } else {
          successfulParts.push({
            PartNumber: result.PartNumber,
            ETag: result.ETag
          });
          onProgress(completedParts, totalParts, failedParts, true, speed);
        }

        return result;
      });

      await Promise.all(batchPromises);
      
      if (i + MAX_CONCURRENT_UPLOADS < totalParts) {
        await delay(50); // Reduced delay from 100ms
      }
    }

    if (successfulParts.length === 0) {
      throw new Error('All parts failed to upload');
    }

    if (failedParts > 0) {
      console.warn(`${failedParts} parts failed, but continuing with ${successfulParts.length} successful parts`);
    }

    return successfulParts
      .sort((a, b) => a.PartNumber - b.PartNumber)
      .map(part => ({
        PartNumber: part.PartNumber,
        ETag: part.ETag
      }));
  };

  const uploadFileMultipart = async (file, fileName, onProgress) => {
    let uploadId, s3Key;

    try {
      console.log(`🚀 Starting multipart upload for: ${fileName} (${(file.size / 1024 / 1024 / 1024).toFixed(2)} GB)`);

      const initiateResponse = await fetch('https://convert.sequoia-print.com/initiate-multipart-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name }),
      });

      if (!initiateResponse.ok) {
        throw new Error(`HTTP ${initiateResponse.status}: Failed to initiate multipart upload`);
      }

      const initiateResult = await initiateResponse.json();
      if (!initiateResult.success) throw new Error(initiateResult.message || 'Failed to initiate multipart upload');

      ({ uploadId, s3Key } = initiateResult);
      console.log(`📦 Multipart upload initiated: ${s3Key}`);

      const partCount = Math.ceil(file.size / CHUNK_SIZE);
      console.log(`🔢 Total parts: ${partCount} (${CHUNK_SIZE / 1024 / 1024}MB each)`);
      
      const urlsResponse = await fetch('https://convert.sequoia-print.com/generate-multipart-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Key, uploadId, partCount }),
      });

      if (!urlsResponse.ok) {
        throw new Error(`HTTP ${urlsResponse.status}: Failed to generate multipart URLs`);
      }

      const urlsResult = await urlsResponse.json();
      if (!urlsResult.success) throw new Error(urlsResult.message || 'Failed to generate multipart URLs');

      console.log(` Generated ${urlsResult.urls.length} presigned URLs`);

      const parts = await uploadPartsParallel(file, urlsResult.urls, onProgress);

      console.log(` Uploaded ${parts.length} parts, validating structure...`);
      
      const isValidParts = parts.every(part => 
        part && 
        typeof part.PartNumber === 'number' && 
        typeof part.ETag === 'string' &&
        Object.keys(part).length === 2
      );

      if (!isValidParts) {
        throw new Error('Invalid parts structure detected');
      }

      console.log(`📤 Sending ${parts.length} parts to complete multipart upload...`);

      const completeResponse = await fetch('https://convert.sequoia-print.com/complete-multipart-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          s3Key, 
          uploadId, 
          parts: parts
        }),
      });

      if (!completeResponse.ok) {
        const errorText = await completeResponse.text();
        console.error('Complete upload error response:', errorText);
        throw new Error(`HTTP ${completeResponse.status}: Failed to complete multipart upload`);
      }

      const completeResult = await completeResponse.json();
      if (!completeResult.success) throw new Error(completeResult.message || 'Failed to complete multipart upload');

      console.log(`🎉 Multipart upload completed successfully: ${s3Key}`);
      return { s3Key, status: 'success' };

    } catch (error) {
      if (uploadId && s3Key) {
        try {
          console.log(` Cleaning up failed multipart upload: ${s3Key}`);
          await fetch('https://convert.sequoia-print.com/abort-multipart-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ s3Key, uploadId }),
          });
          console.log(` Successfully aborted multipart upload: ${s3Key}`);
        } catch (abortError) {
          console.error(' Failed to abort multipart upload:', abortError);
        }
      }

      console.error(`💥 Multipart upload failed for ${fileName}:`, error);
      return { 
        s3Key: '', 
        status: 'failed', 
        error: error.message 
      };
    }
  };

  const uploadFileDirect = async (file, uploadUrl, s3Key) => {
    try {
      console.log(`⬆️ Direct uploading: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'application/postscript' },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      console.log(` Direct upload successful: ${s3Key}`);
      return { s3Key, status: 'success' };
    } catch (error) {
      console.error(` Direct upload failed for ${file.name}:`, error);
      return { 
        s3Key: '', 
        status: 'failed', 
        error: error.message 
      };
    }
  };

  const processFiles = async (files) => {
    try {
      setUploadStep('generating-urls');
      setUploading(true);
      
      const fileNames = files.map(f => f.name);
      const fileSizes = files.map(f => f.size);
      
      console.log(` Processing ${files.length} files...`);

      const urlResponse = await fetch('https://convert.sequoia-print.com/generate-upload-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileNames, fileSizes }),
      });

      if (!urlResponse.ok) {
        throw new Error(`HTTP ${urlResponse.status}: Failed to get upload URLs`);
      }

      const urlResult = await urlResponse.json();
      if (!urlResult.success) throw new Error(urlResult.message || 'Failed to get upload URLs');

      setUploadStep('uploading');
      const uploadUrls = urlResult.urls;
      const uploadResults = [];
      
      const totalParts = files.reduce((total, file) => {
        return total + (file.size > 100 * 1024 * 1024 ? Math.ceil(file.size / CHUNK_SIZE) : 1);
      }, 0);

      setUploadProgress({ 
        current: 0, 
        total: totalParts, 
        speed: '0 MB/s',
        failedParts: 0,
        retrying: false
      });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { uploadUrl, s3Key, fileName, uploadType } = uploadUrls[i];

        console.log(`🚀 Starting upload ${i + 1}/${files.length}: ${fileName}`);

        const progressCallback = (current, total, failed, isRetry = false, speed = '0') => {
          setUploadProgress(prev => ({
            current: current,
            total: prev.total,
            speed: `${speed} MB/s`,
            failedParts: failed,
            retrying: isRetry
          }));
        };

        let uploadResult;

        if (uploadType === 'multipart') {
          uploadResult = await uploadFileMultipart(file, fileName, progressCallback);
        } else {
          uploadResult = await uploadFileDirect(file, uploadUrl, s3Key);
          setUploadProgress(prev => ({
            ...prev,
            current: prev.current + 1,
            speed: 'Direct'
          }));
        }

        uploadResults.push({
          fileName,
          s3Key: uploadResult.s3Key,
          status: uploadResult.status,
          error: uploadResult.error,
        });

        if (uploadResult.status === 'success') {
          console.log(` Successfully uploaded: ${fileName}`);
        } else {
          console.error(` Failed to upload: ${fileName}`, uploadResult.error);
        }
      }

      const successfulUploads = uploadResults.filter(r => r.status === 'success');
      
      if (successfulUploads.length === 0) {
        throw new Error('No files were successfully uploaded. Check console for details.');
      }

      console.log(` Upload summary: ${successfulUploads.length}/${files.length} files successful`);

      setUploadStep('converting');
      setUploading(false);
      setConverting(true);

      const s3Keys = successfulUploads.map(r => r.s3Key);
      
      console.log(` Starting PARALLEL conversion for ${s3Keys.length} files...`);
      
      const convertResponse = await fetch('https://convert.sequoia-print.com/convert-s3-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Keys: s3Keys.join(',') }),
      });

      if (!convertResponse.ok) {
        throw new Error(`HTTP ${convertResponse.status}: Conversion request failed`);
      }

      const convertResult = await convertResponse.json();
      if (!convertResult.success) throw new Error(convertResult.message || 'Conversion failed');

      console.log('🎉 Conversion completed successfully!');
      if (convertResult.performance) {
        console.log(`⚡ Performance: ${convertResult.performance.totalTimeMinutes} minutes total`);
      }
      setResponse(convertResult);

    } catch (error) {
      console.error('💥 Processing failed:', error);
      alert(`Processing failed: ${error.message}\n\nCheck browser console for detailed logs.`);
    } finally {
      setUploading(false);
      setConverting(false);
      setUploadStep(null);
      setUploadProgress({ 
        current: 0, 
        total: 0, 
        speed: '0 MB/s',
        failedParts: 0,
        retrying: false
      });
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
        if (!structure[timestamp]) structure[timestamp] = {};
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
              <span className="ml-2 text-sm text-gray-500">({folderData.jpgCount} JPGs)</span>
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
    if (uploadStep === 'generating-urls') return "Preparing upload links...";
    if (uploadStep === 'uploading') {
      const baseMessage = `Uploading files (${uploadProgress.current}/${uploadProgress.total}) • ${uploadProgress.speed}`;
      if (uploadProgress.failedParts > 0) {
        return `${baseMessage} • ${uploadProgress.failedParts} parts failed`;
      }
      if (uploadProgress.retrying) {
        return `${baseMessage} • Retrying failed parts...`;
      }
      return baseMessage;
    }
    if (uploadStep === 'converting') return "Converting AI files to JPG format in parallel... Much faster now!";
    return "";
  };

  const fileStructure = formatFileStructure();

  return (
    <div className="p-12 max-w-6xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Bulk AI to JPG Converter</h1>
      <p className="text-gray-600 mb-8">Convert up to 20 AI files to JPG format with parallel processing • Up to 5x faster!</p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive || dragOver ? 'border-blue-500 bg-blue-50' : 'border-orange-600 bg-orange-50 hover:bg-orange-100'
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
            <p className="text-lg text-gray-700 mb-2">Drag & drop AI files here, or click to select</p>
            <p className="text-sm text-gray-500">Maximum 20 files • AI format only • Parallel processing for speed</p>
          </div>
        )}
      </div>

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

      {response && (
        <div className="mt-8 space-y-6">
          {response.downloadUrl && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-green-800 mb-1"> Conversion Complete!</h3>
                  <p className="text-green-600">
                    Successfully processed {response.successful} out of {response.totalFiles} file{response.totalFiles > 1 ? 's' : ''}
                    {response.failed > 0 && <span className="text-orange-600 ml-2">({response.failed} failed)</span>}
                  </p>
                  {response.performance && (
                    <p className="text-sm text-green-600 mt-1">
                      ⚡ Total time: {response.performance.totalTimeMinutes} minutes
                    </p>
                  )}
                  {response.cleanup && (
                    <p className="text-sm text-green-500 mt-1">
                       Cleaned up {response.cleanup.originalFilesDeleted} original files and {response.cleanup.conversionFoldersDeleted} temp folders
                    </p>
                  )}
                </div>
                <a href={response.downloadUrl} download className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg">
                  <Download size={20} className="mr-2" /> Download ZIP
                </a>
              </div>
            </div>
          )}

          {fileStructure && Object.keys(fileStructure).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Folder className="mr-2" size={20} /> File Structure (in ZIP)
              </h3>
              <div className="font-mono text-sm bg-gray-50 rounded p-4 text-left">
                {renderFileTree(fileStructure)}
              </div>
            </div>
          )}

          {response.details && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-left">Conversion Details</h3>
              <div className="space-y-2">
                {response.details.map((detail, index) => (
                  <div key={index} className={`p-3 rounded border ${
                    detail.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-left">
                        {detail.originalKey ? detail.originalKey.split('/').pop() : 'Unknown'}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        detail.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {detail.status === 'completed' ? ` ${detail.jpgCount} JPGs` : ` Failed`}
                      </span>
                    </div>
                    {detail.error && <p className="text-red-600 text-sm mt-1 text-left">{detail.error}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {response && !response.success && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700"> Error: {response.message}</p>
          <p className="text-red-600 text-sm mt-2">Check browser console for detailed error information.</p>
        </div>
      )}
    </div>
  );
};

export default BulkConverter;