import React from 'react';
import { QrCode, BarChart3 } from 'lucide-react';

export default function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <QrCode className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">QR Generator</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="/"
              className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Generate</span>
            </a>
            <a
              href="/dashboard"
              className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}