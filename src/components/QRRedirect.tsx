import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, AlertCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function QRRedirect() {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get the ID from the query parameter
    const id = searchParams.get('id');
    if (!id) {
      setError('No QR code ID provided in the QR code');
      return;
    }
    // Look up the destination URL from Supabase
    (async () => {
      try {
        const { data, error } = await supabase.from('qr_links').select('destination_url').eq('id', id).single();
        if (error || !data) {
          setError('QR code not found or has been deleted.');
          return;
        }
        let decodedUrl = data.destination_url;
        // Ensure URL has protocol
        if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
          decodedUrl = `https://${decodedUrl}`;
        }
        setDestinationUrl(decodedUrl);
        // Start countdown and redirect
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              window.location.replace(decodedUrl);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setTimeout(() => {
          window.location.replace(decodedUrl);
        }, 100);
        return () => clearInterval(countdownInterval);
      } catch (error) {
        setError('Error looking up QR code destination.');
      }
    })();
  }, [searchParams]);

  // Manual redirect function
  const redirectNow = () => {
    if (destinationUrl) {
      window.location.replace(destinationUrl);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-lg mx-auto">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New QR Code
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-lg mx-auto">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRight className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirecting...</h1>
          <p className="text-gray-600">Taking you to your destination in {countdown} seconds</p>
        </div>

        {destinationUrl && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Destination:</p>
              <p className="font-mono text-sm text-blue-600 break-all">{destinationUrl}</p>
            </div>
            
            <button
              onClick={redirectNow}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Go Now →
            </button>
            
            <a
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}