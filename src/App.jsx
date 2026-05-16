import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
      <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all hover:scale-105 duration-300">
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Laravel + React
        </h1>
        <p className="text-slate-300 text-lg mb-8">
          Your project has been successfully set up with Laravel 10 for the backend, and Vite + React + Tailwind CSS for the frontend.
        </p>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors duration-200">
            Frontend Docs
          </button>
          <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold transition-colors duration-200">
            Backend Docs
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
