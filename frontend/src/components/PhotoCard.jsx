import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { teamService } from '../services/teamService';
import toast from 'react-hot-toast';

const PhotoCard = ({ 
  level, 
  isCompleted = false, 
  isCurrent = false, 
  showActions = true, 
  compact = false,
  submissions = [],
  onSubmission 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const levelSubmission = submissions.find(sub => 
    sub.levelId?._id === level._id || sub.level?._id === level._id
  );

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await teamService.submitPhoto(level._id, formData);
      
      toast.success(response.message || 'Photo submitted successfully!');
      
      if (onSubmission) {
        onSubmission();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit photo');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: isUploading || isCompleted || !isCurrent
  });

  const getStatusConfig = () => {
    if (isCompleted) {
      return {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="w-4 h-4" />,
        text: 'Completed'
      };
    }
    
    if (levelSubmission) {
      switch (levelSubmission.status) {
        case 'approved':
        case 'auto_approved':
          return {
            color: 'bg-green-100 text-green-800 border-green-200',
            icon: <CheckCircle className="w-4 h-4" />,
            text: 'Approved'
          };
        case 'rejected':
        case 'auto_rejected':
          return {
            color: 'bg-red-100 text-red-800 border-red-200',
            icon: <AlertCircle className="w-4 h-4" />,
            text: 'Rejected'
          };
        case 'pending':
        default:
          return {
            color: 'bg-amber-100 text-amber-800 border-amber-200',
            icon: <Clock className="w-4 h-4" />,
            text: 'Under Review'
          };
      }
    }

    if (isCurrent) {
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <Camera className="w-4 h-4" />,
        text: 'Current Level'
      };
    }

    return {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <Clock className="w-4 h-4" />,
      text: 'Locked'
    };
  };

  const statusConfig = getStatusConfig();

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-white/20 p-4 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              {level.levelNumber}
            </div>
            <span className="font-semibold text-slate-800">Level {level.levelNumber}</span>
          </div>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.text}</span>
          </span>
        </div>
        
        {level.hint && (
          <div className="mb-3">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </button>
            {showHint && (
              <p className="mt-1 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                {level.hint}
              </p>
            )}
          </div>
        )}

        {levelSubmission && (
          <div className="text-sm text-slate-600">
            Score: {levelSubmission.similarityScore ? Math.round(levelSubmission.similarityScore) : 'N/A'}%
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            {level.levelNumber}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Level {level.levelNumber}</h3>
            {level.isFinal && (
              <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                Final Challenge
              </span>
            )}
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
          {statusConfig.icon}
          <span className="ml-2">{statusConfig.text}</span>
        </span>
      </div>

      {level.hint && (
        <div className="mb-4">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
          >
            <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showHint ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showHint && (
            <div className="mt-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-slate-700">{level.hint}</p>
            </div>
          )}
        </div>
      )}

      {level.description && (
        <p className="text-slate-600 mb-4">{level.description}</p>
      )}

      {levelSubmission && (
        <div className="mb-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Your Score:</span>
            <span className="text-lg font-bold text-slate-800">
              {levelSubmission.similarityScore ? Math.round(levelSubmission.similarityScore) : 'N/A'}%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Submitted: {new Date(levelSubmission.submittedAt || levelSubmission.createdAt).toLocaleString()}
          </div>
        </div>
      )}

      {showActions && isCurrent && !isCompleted && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-slate-400" />
              <p className="text-slate-600">
                {isDragActive ? 'Drop your photo here' : 'Click or drag to upload your photo'}
              </p>
              <p className="text-xs text-slate-500">
                Supports: JPG, PNG, GIF, WebP
              </p>
            </div>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">Level Completed!</p>
          {levelSubmission && (
            <p className="text-sm text-green-600 mt-1">
              Score: {Math.round(levelSubmission.similarityScore)}%
            </p>
          )}
        </div>
      )}

      {!isCurrent && !isCompleted && (
        <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 font-medium">Level Locked</p>
          <p className="text-sm text-slate-500 mt-1">
            Complete previous levels to unlock
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoCard;
