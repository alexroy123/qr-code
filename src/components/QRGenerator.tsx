import React, { useState } from 'react';
import { QrCode, Download, Copy, Check, AlertCircle, ExternalLink } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { supabase } from '../lib/supabase';

export default function QRGenerator() {
  const [url, setUrl] = useState('');
  const [qrData, setQrData] = useState<{ redirectUrl: string; qrCodeUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateQRCode = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      // Encode the URL directly in the redirect URL
      const encodedUrl = encodeURIComponent(url.trim());
      const redirectUrl = `${window.location.origin}/q?url=${encodedUrl}`;
      
      console.log('Generated redirect URL:', redirectUrl);
      console.log('Will redirect to:', url.trim());

      // Generate QR code
      const qrCodeUrl = await QRCodeLib.toDataURL(redirectUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      });

      // Store in Supabase
      const { error } = await supabase.from('qr_links').insert({ destination_url: url.trim() });
      if (error) {
        console.error('Error saving to database:', error);
        alert('Failed to save QR code to database.');
      }

      setQrData({
        redirectUrl,
        qrCodeUrl
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData?.qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrData.qrCodeUrl;
    link.click();
  };

  const copyLink = async () => {
    if (!qrData?.redirectUrl) return;

    try {
      await navigator.clipboard.writeText(qrData.redirectUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const testRedirect = () => {
    if (!qrData?.redirectUrl) return;
    window.open(qrData.redirectUrl, '_blank');
  };

  const isLocalDevelopment = window.location.hostname === 'localhost' || 
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname.includes('webcontainer');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <QrCode className="w-12 h-12 text-blue-600 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">QR Generator</h1>
          </div>
          <p className="text-gray-600 text-lg">Create QR codes that redirect directly to any URL</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Destination URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://google.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            onClick={generateQRCode}
            disabled={loading || !url.trim()}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </div>

        {qrData && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your QR Code</h2>
              <p className="text-gray-600">Scan to redirect directly to your destination</p>
            </div>

            {/* Development Notice */}
            {isLocalDevelopment && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">✅ Direct Redirect Enabled</p>
                    <p>This QR code will redirect immediately to: <strong>{url}</strong></p>
                    <p className="mt-1">No database required - works instantly!</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <img
                  src={qrData.qrCodeUrl}
                  alt="Generated QR Code"
                  className="w-72 h-72 object-contain"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={qrData.redirectUrl}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button
                    onClick={copyLink}
                    className="flex items-center space-x-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Final Destination
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={url}
                    readOnly
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-green-50 text-sm font-medium"
                  />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-sm">Visit</span>
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={downloadQR}
                  className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR</span>
                </button>
                <button
                  onClick={testRedirect}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Test Redirect</span>
                </button>
                <button
                  onClick={() => {
                    setQrData(null);
                    setUrl('');
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}