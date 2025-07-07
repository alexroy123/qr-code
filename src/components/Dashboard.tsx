import React, { useState, useEffect } from 'react';
import { supabase, QRLink } from '../lib/supabase';
import { Edit3, Save, X, Copy, Check, QrCode, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import QRCodeLib from 'qrcode';

export default function Dashboard() {
  const [qrLinks, setQrLinks] = useState<QRLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrPreviews, setQrPreviews] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadQRLinks();
  }, []);

  const loadQRLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQrLinks(data || []);
    } catch (error) {
      console.error('Error loading QR links:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (link: QRLink) => {
    setEditingId(link.id);
    setEditValue(link.destination_url);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
  };

  const saveEdit = async (id: string) => {
    if (!editValue.trim()) return;

    try {
      const { error } = await supabase
        .from('qr_links')
        .update({ destination_url: editValue.trim() })
        .eq('id', id);

      if (error) throw error;

      setQrLinks(links =>
        links.map(link =>
          link.id === id ? { ...link, destination_url: editValue.trim() } : link
        )
      );
      setEditingId(null);
      setEditValue('');
      
      // Clear the QR preview so it regenerates with new URL
      setQrPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[id];
        return newPreviews;
      });
      // Regenerate QR preview with updated URL
      const updatedLink = qrLinks.find(link => link.id === id);
      if (updatedLink) {
        generateQRPreview({ ...updatedLink, destination_url: editValue.trim() });
      }
    } catch (error) {
      console.error('Error updating link:', error);
      alert('Failed to update link. Please try again.');
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) return;

    try {
      const { error } = await supabase
        .from('qr_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setQrLinks(links => links.filter(link => link.id !== id));
      
      // Remove QR preview
      setQrPreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[id];
        return newPreviews;
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('Failed to delete link. Please try again.');
    }
  };

  const copyLink = async (destinationUrl: string) => {
    // Generate the direct redirect URL
    const encodedUrl = encodeURIComponent(destinationUrl);
    const redirectUrl = `${window.location.origin}/q?url=${encodedUrl}`;
    
    try {
      await navigator.clipboard.writeText(redirectUrl);
      setCopiedId(destinationUrl);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const generateQRPreview = async (link: QRLink) => {
    if (qrPreviews[link.id]) return;

    try {
      // Generate the direct redirect URL (same as in QRGenerator)
      const encodedUrl = encodeURIComponent(link.destination_url);
      const redirectUrl = `${window.location.origin}/q?url=${encodedUrl}`;
      
      const qrCodeUrl = await QRCodeLib.toDataURL(redirectUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      });

      setQrPreviews(prev => ({ ...prev, [link.id]: qrCodeUrl }));
    } catch (error) {
      console.error('Error generating QR preview:', error);
    }
  };

  const downloadQR = async (link: QRLink) => {
    try {
      // Generate full-size QR code for download
      const encodedUrl = encodeURIComponent(link.destination_url);
      const redirectUrl = `${window.location.origin}/q?url=${encodedUrl}`;
      
      const qrCodeUrl = await QRCodeLib.toDataURL(redirectUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      });

      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-code-${link.id}.png`;
      downloadLink.href = qrCodeUrl;
      downloadLink.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const testRedirect = (destinationUrl: string) => {
    const encodedUrl = encodeURIComponent(destinationUrl);
    const redirectUrl = `${window.location.origin}/q?url=${encodedUrl}`;
    window.open(redirectUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">QR Code Dashboard</h1>
          <p className="text-gray-600 text-lg">Manage your generated QR codes</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <a
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Create New QR Code</span>
          </a>
          
          <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
            <AlertCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">Direct redirect enabled - no database dependency!</span>
          </div>
        </div>

        {qrLinks.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No QR codes yet</h2>
            <p className="text-gray-600 mb-4">Create your first QR code to get started</p>
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create QR Code
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {qrLinks.map((link) => (
              <div key={link.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-500">ID:</span>
                      <code className="text-sm font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {link.id}
                      </code>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">Destination URL:</span>
                      {editingId === link.id ? (
                        <div className="flex items-center space-x-2 mt-1">
                          <input
                            type="url"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() => saveEdit(link.id)}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-gray-900 break-all font-medium">{link.destination_url}</span>
                          <button
                            onClick={() => startEditing(link)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <a
                            href={link.destination_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-500">QR Code Link:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded break-all flex-1">
                          {window.location.origin}/q?url={encodeURIComponent(link.destination_url)}
                        </code>
                        <button
                          onClick={() => copyLink(link.destination_url)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          {copiedId === link.destination_url ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Created: {new Date(link.created_at).toLocaleDateString()} at {new Date(link.created_at).toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      {qrPreviews[link.id] ? (
                        <img
                          src={qrPreviews[link.id]}
                          alt="QR Code Preview"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <button
                          onClick={() => generateQRPreview(link)}
                          className="p-3 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <QrCode className="w-8 h-8" />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadQR(link)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        title="Download QR code"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => testRedirect(link.destination_url)}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        title="Test redirect"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        title="Delete QR code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}