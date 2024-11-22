import React, { useState, useEffect } from "react";
import './App.css';
import DataTable from './DataTable';
import { toast, Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';

// Helper function to safely access api
const getApi = () => {
  if (typeof window !== 'undefined' && window.api) {
    return window.api;
  }
  return null;
};

function App() {
  const [parameters, setParameters] = useState({
    writeup: "",
    url: "",
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Load saved values from cookies on component mount
  useEffect(() => {
    const savedWriteup = Cookies.get('writeup') || "";
    const savedUrl = Cookies.get('url') || "";
    const savedUsername = Cookies.get('username') || "";
    const savedPassword = Cookies.get('password') || "";

    setParameters({
      writeup: savedWriteup,
      url: savedUrl,
      username: savedUsername,
      password: savedPassword
    });
  }, []);

  useEffect(() => {
    const api = getApi();
    if (!api) {
      console.warn('API not available');
      return;
    }

    const handleAutomationComplete = (data) => {
      setIsLoading(false);

      if (data.status === 'error') {
        toast.dismiss();
        toast.error(data.message, {
          duration: 5000,
        });
      } else {
        toast.dismiss();
        toast.success("Automation completed successfully!", {
          duration: 3000,
        });
      }
    };

    api.receive('automation-complete', handleAutomationComplete);

    return () => {
      api.removeAllListeners('automation-complete');
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParameters((prevParams) => ({
      ...prevParams,
      [name]: value
    }));
    
    // Save to cookie whenever input changes
    Cookies.set(name, value, { expires: 7 }); // Cookies expire in 7 days
  };

  const validateInput = () => {
    if (!parameters.writeup.trim()) {
      toast.dismiss();
      toast.error("Please enter some data in the text area", {
        duration: 3000,
      });
      return false;
    }
    
    if (!parameters.url || !parameters.username || !parameters.password) {
      toast.dismiss();
      toast.error("Please fill in all credential fields", {
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const handleCreate = () => {
    const api = getApi();
    if (!api) {
      toast.dismiss();
      toast.error("API not available. Ensure you're running in the Electron environment.", {
        duration: 5000,
      });
      return;
    }

    if (!validateInput()) {
      return;
    }

    setIsLoading(true);

    try {
      api.send('start-automation', parameters);
      toast.dismiss();
      toast.loading("Automation started. Please wait...", {
        duration: 3000,
      });
    } catch (err) {
      setIsLoading(false);
      toast.dismiss();
      toast.error(`Failed to start automation: ${err.message}`, {
        duration: 5000,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Toaster position="bottom-center" reverseOrder={true}/>
      <h1 className="text-2xl font-bold mb-4">AllO</h1>
      
      <div className="mb-4">
        <textarea
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          id="writeup"
          name="writeup"
          rows="5"
          value={parameters.writeup}
          onChange={handleInputChange}
          placeholder="Paste your tab-delimited data here..."
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <button
          type="button"
          onClick={handleCreate}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-white ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Processing...' : 'Start Automation'}
        </button>
        <button 
          className="accordion-trigger"
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
        >
          <span>More </span>
          <span className={`accordion-icon ${isAccordionOpen ? 'open' : ''}`}>▼</span>
        </button>
      </div>

      <div className="accordion-container flex items-center space-x-4 mb-4">
        <div className={`accordion-content ${isAccordionOpen ? 'open' : ''}`}>
          <div className="accordion-inner">
            <div className="form-group">
              <label htmlFor="url">URL</label>
              <input
                type="url"
                id="url"
                name="url"
                value={parameters.url}
                onChange={handleInputChange}
                placeholder="Enter URL"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={parameters.username}
                onChange={handleInputChange}
                placeholder="Enter username"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={parameters.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      <DataTable data={parameters.writeup} />
    </div>
  );
}

export default App;