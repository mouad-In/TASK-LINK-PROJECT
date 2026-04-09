import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
          <Search className="w-12 h-12 text-white" />
        </div>
        <div className="space-y-4">
          <h1 className="text-6xl font-black bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            Page Not Found
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-2xl hover:from-fuchsia-500 hover:to-purple-500 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

