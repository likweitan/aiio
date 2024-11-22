import React, { useState } from 'react';

function Settings() {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(false);

  const handleSave = () => {
    console.log('Settings Saved:', { theme, notifications });
    // You can use IPC to send settings to the main process or store in localStorage
  };

  return (
    <div>
      <h1>Settings</h1>
      <div>
        <label>Choose Theme:</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div>
        <label>Enable Notifications:</label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
      </div>
      <button onClick={handleSave}>Save Settings</button>
    </div>
  );
}

export default Settings;
