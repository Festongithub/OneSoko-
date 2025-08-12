import React, { useState, useCallback } from 'react';
import {
  CheckBadgeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  EyeIcon,
  DownloadIcon,
  TrashIcon,
  PlusIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Shop } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { shopsAPI } from '../../services/api';

interface BusinessVerificationProps {
  shop: Shop;
  onVerificationUpdate?: (updatedShop: Shop) => void;
}

interface VerificationDocument {
  id: string;
  name: string;
  type: 'business_license' | 'tax_certificate' | 'identity_document' | 'bank_statement' | 'utility_bill' | 'other';
  file: File | null;
  url?: string;
  uploadedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

const BusinessVerification: React.FC<BusinessVerificationProps> = ({ 
  shop, 
  onVerificationUpdate 
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<VerificationDocument[]>(
    shop.verification_documents?.map(doc => ({
      id: doc.id || Math.random().toString(36).substr(2, 9),
      name: doc.name || '',
      type: doc.type as any || 'other',
      file: null,
      url: doc.url,
      uploadedAt: doc.uploadedAt,
      status: doc.status as any || 'pending',
      rejectionReason: doc.rejectionReason
    })) || []
  );
  const [loading, setLoading] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const documentTypes = [
    { value: 'business_license', label: 'Business License', required: true },
    { value: 'tax_certificate', label: 'Tax Certificate', required: true },
    { value: 'identity_document', label: 'Identity Document', required: true },
    { value: 'bank_statement', label: 'Bank Statement', required: false },
    { value: 'utility_bill', label: 'Utility Bill', required: false },
    { value: 'other', label: 'Other Document', required: false },
  ];

  const getVerificationStatusInfo = () => {
    switch (shop.verification_status) {
      case 'not_started':
        return {
          icon: <DocumentTextIcon className="w-8 h-8 text-gray-400" />,
          title: 'Verification Not Started',
          description: 'Upload required documents to begin the verification process.',
          color: 'gray'
        };
      case 'pending':
        return {
          icon: <ClockIcon className="w-8 h-8 text-yellow-500" />,
          title: 'Verification Pending',
          description: 'Your documents are being reviewed. This usually takes 2-5 business days.',
          color: 'yellow'
        };
      case 'under_review':
        return {
          icon: <ClockIcon className="w-8 h-8 text-blue-500" />,
          title: 'Under Review',
          description: 'Our team is currently reviewing your submitted documents.',
          color: 'blue'
        };
      case 'approved':
        return {
          icon: <CheckBadgeIcon className="w-8 h-8 text-green-500" />,
          title: 'Verification Approved',
          description: 'Your business has been successfully verified!',
          color: 'green'
        };
      case 'rejected':
        return {
          icon: <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />,
          title: 'Verification Rejected',
          description: 'Some documents need to be resubmitted. Please check the feedback below.',
          color: 'red'
        };
      default:
        return {
          icon: <DocumentTextIcon className="w-8 h-8 text-gray-400" />,
          title: 'Unknown Status',
          description: 'Please contact support for assistance.',
          color: 'gray'
        };
    }
  };

  const addDocument = () => {
    const newDoc: VerificationDocument = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      type: 'other',
      file: null,
      status: 'pending'
    };
    setDocuments([...documents, newDoc]);
  };

  const removeDocument = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  const updateDocument = (docId: string, updates: Partial<VerificationDocument>) => {
    setDocuments(documents.map(doc => 
      doc.id === docId ? { ...doc, ...updates } : doc
    ));
  };

  const handleFileUpload = useCallback(async (docId: string, file: File) => {
    setUploadingDocId(docId);
    
    try {
      // Simulate file upload - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const fileName = file.name;
      const fileUrl = URL.createObjectURL(file); // In real app, this would be the server URL
      
      updateDocument(docId, {
        file,
        name: fileName,
        url: fileUrl,
        uploadedAt: new Date().toISOString(),
        status: 'pending'
      });
      
      setMessage({ 
        type: 'success', 
        text: `Document "${fileName}" uploaded successfully!` 
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to upload document. Please try again.' 
      });
    } finally {
      setUploadingDocId(null);
      setTimeout(() => setMessage(null), 5000);
    }
  }, []);

  const submitForVerification = async () => {
    setLoading(true);
    
    try {
      // Check if required documents are uploaded
      const requiredTypes = documentTypes.filter(type => type.required).map(type => type.value);
      const uploadedTypes = documents.filter(doc => doc.file || doc.url).map(doc => doc.type);
      const missingRequired = requiredTypes.filter(type => !uploadedTypes.includes(type));
      
      if (missingRequired.length > 0) {
        const missingLabels = missingRequired.map(type => 
          documentTypes.find(dt => dt.value === type)?.label
        ).join(', ');
        
        setMessage({ 
          type: 'error', 
          text: `Please upload required documents: ${missingLabels}` 
        });
        return;
      }
      
      // Simulate API call to submit verification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedShop = {
        ...shop,
        verification_status: 'pending' as const,
        verification_documents: documents.map(doc => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          url: doc.url,
          uploadedAt: doc.uploadedAt,
          status: doc.status,
          rejectionReason: doc.rejectionReason
        }))
      };
      
      onVerificationUpdate?.(updatedShop);
      
      setMessage({ 
        type: 'success', 
        text: 'Verification documents submitted successfully! You will receive an update within 2-5 business days.' 
      });
      
    } catch (error) {
      console.error('Error submitting verification:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to submit verification. Please try again.' 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 7000);
    }
  };

  const statusInfo = getVerificationStatusInfo();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Business Verification
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Verify your business to build trust with customers and unlock additional features
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : message.type === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
        }`}>
          <InformationCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Verification Status */}
      <div className={`mb-8 p-6 rounded-xl border-2 ${
        statusInfo.color === 'green' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
        statusInfo.color === 'yellow' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :
        statusInfo.color === 'blue' ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' :
        statusInfo.color === 'red' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
        'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
      }`}>
        <div className="flex items-center space-x-4">
          {statusInfo.icon}
          <div>
            <h2 className={`text-xl font-semibold ${
              statusInfo.color === 'green' ? 'text-green-900 dark:text-green-100' :
              statusInfo.color === 'yellow' ? 'text-yellow-900 dark:text-yellow-100' :
              statusInfo.color === 'blue' ? 'text-blue-900 dark:text-blue-100' :
              statusInfo.color === 'red' ? 'text-red-900 dark:text-red-100' :
              'text-gray-900 dark:text-gray-100'
            }`}>
              {statusInfo.title}
            </h2>
            <p className={`${
              statusInfo.color === 'green' ? 'text-green-700 dark:text-green-300' :
              statusInfo.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-300' :
              statusInfo.color === 'blue' ? 'text-blue-700 dark:text-blue-300' :
              statusInfo.color === 'red' ? 'text-red-700 dark:text-red-300' :
              'text-gray-700 dark:text-gray-300'
            }`}>
              {statusInfo.description}
            </p>
            {shop.verification_date && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Verified on {new Date(shop.verification_date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Required Documents Info */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Required Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documentTypes.filter(type => type.required).map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <CheckBadgeIcon className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 dark:text-blue-200">{type.label}</span>
            </div>
          ))}
        </div>
        <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
          These documents are required for business verification. Additional documents may be requested during review.
        </p>
      </div>

      {/* Document Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Verification Documents
          </h3>
          {shop.verification_status !== 'approved' && (
            <button
              onClick={addDocument}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Document
            </button>
          )}
        </div>

        <div className="space-y-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Type
                    </label>
                    <select
                      value={doc.type}
                      onChange={(e) => updateDocument(doc.id, { type: e.target.value as any })}
                      disabled={shop.verification_status === 'approved'}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    >
                      {documentTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} {type.required && '*'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={doc.name}
                      onChange={(e) => updateDocument(doc.id, { name: e.target.value })}
                      disabled={shop.verification_status === 'approved'}
                      placeholder="Enter document name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>
                {shop.verification_status !== 'approved' && (
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="ml-4 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* File Upload Area */}
              {shop.verification_status !== 'approved' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    {uploadingDocId === doc.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Uploading...</span>
                      </div>
                    ) : doc.url ? (
                      <div className="flex items-center justify-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <DocumentTextIcon className="w-6 h-6 text-green-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {doc.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(doc.url, '_blank')}
                            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              const a = document.createElement('a');
                              a.href = doc.url!;
                              a.download = doc.name;
                              a.click();
                            }}
                            className="p-1 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Drop your file here, or{' '}
                          <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                            browse
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(doc.id, file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, JPG, PNG, DOC up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    doc.status === 'approved' ? 'bg-green-500' :
                    doc.status === 'rejected' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    doc.status === 'approved' ? 'text-green-700 dark:text-green-400' :
                    doc.status === 'rejected' ? 'text-red-700 dark:text-red-400' :
                    'text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </div>
                {doc.uploadedAt && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Rejection Reason */}
              {doc.status === 'rejected' && doc.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    <strong>Rejection Reason:</strong> {doc.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          ))}

          {documents.length === 0 && (
            <div className="text-center py-8">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No documents uploaded yet. Add your first document to begin verification.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      {shop.verification_status !== 'approved' && documents.some(doc => doc.url) && (
        <div className="flex justify-center">
          <button
            onClick={submitForVerification}
            disabled={loading || shop.verification_status === 'pending' || shop.verification_status === 'under_review'}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Submitting...' : 
             shop.verification_status === 'pending' || shop.verification_status === 'under_review' ? 'Already Submitted' :
             'Submit for Verification'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BusinessVerification;
