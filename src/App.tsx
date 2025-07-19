import { BrowserRouter, Routes, Route } from "react-router-dom";

const Landing = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">Jobpilot.ai</h1>
      <p className="text-xl mb-8">AI-Powered Job Search Automation</p>
      <a href="/auth" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Get Started
      </a>
    </div>
  </div>
);

const Auth = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter your password"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </div>
  </div>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;