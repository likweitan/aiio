const { app, BrowserWindow, ipcMain, Menu } = require("electron");
const path = require("path");
const { chromium } = require("playwright"); // Import Playwright

function createWindow() {
  const basePath = app.getAppPath();
  const preloadPath = path.join(basePath, "src/electron/preload.cjs");
  console.log(preloadPath);
  const iconPath = path.resolve(__dirname, "assets/icons/favicon.ico");
  console.log(iconPath); // Ensure this points to the correct file
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, "assets/icons/favicon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: preloadPath, // Specify the path to preload.js
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), "dist-react/index.html"));
}

function createSettingsWindow() {
    // Create a new window for settings
    settingsWindow = new BrowserWindow({
      width: 400,
      height: 300,
      webPreferences: {
        nodeIntegration: true,
      }
    });
  
    settingsWindow.loadFile('settings.html');
    settingsWindow.on('closed', () => {
      settingsWindow = null;
    });
  }

// Define the menu template
const menuTemplate = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          click: () => {
            console.log('Open menu item clicked');
          }
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: 'Redo',
          accelerator: 'CmdOrCtrl+Y',
          role: 'redo'
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        }
      ]
    },
    {
      label: 'Settings',
      submenu: [
        {
          label: 'Open Settings',
          click: () => {
            createSettingsWindow(); // Open settings window when clicked
          }
        }
      ]
    }
  ];

// Create the menu
const menu = Menu.buildFromTemplate(menuTemplate);

// Set the menu to the app
Menu.setApplicationMenu(menu);

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Main process listens for the input parameters from the renderer
ipcMain.on("start-automation", async (event, parameters) => {
  console.log("Received parameters:", parameters);

  // Perform Playwright automation with the received parameters
  try {
    // Perform Playwright automation
    await runAutomation(parameters);

    // Send a success message back to the renderer
    event.sender.send("automation-complete", {
      status: "success",
      message: "Automation completed successfully.",
    });
  } catch (error) {
    console.error(error);

    // Send an error message back to the renderer
    event.sender.send("automation-complete", {
      status: "error",
      message: error.message,
    });
  }
});

// Playwright automation function
async function runAutomation(parameters) {
  const result = parseTabDelimitedData(parameters.writeup);
  console.log(result);

  const { day, month } = parseDate(result.Date);
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    httpCredentials: {
      username: parameters.username,
      password: parameters.password,
    },
  });

  const page = await context.newPage();

  // Set viewport size to a large resolution (like 1920x1080)
  await page.setViewportSize({ width: 1920, height: 1080 });

  await page.goto(parameters.url);
  console.log(await page.title()); // Prints the page title

  // Click the "Schedule Message" button for Chloe_KYI
  await page.click(
    '#Chloe_KYI td#Chloe_KYI_action > button[data-toggle="tooltip"][title="Schedule Message"]'
  );
  // Select the year
  await page.selectOption('select[name="year[delivery]"]', "2024"); // Year

  // Select the month
  await page.selectOption(
    'select[name="month[delivery]"]',
    month.toString().padStart(2, "0")
  ); // November

  // Select the day
  await page.selectOption(
    'select[name="day[delivery]"]',
    day.toString().padStart(2, "0")
  ); // 24th day

  await page.fill("#from", result.From); // Replace 'SampleValue123' with the desired input
  await page.fill('input[name="subject"]', result.Subject); // Replace 'SampleValue123' with the desired input

  await page.pause();
}

function parseTabDelimitedData(data) {
  // Split the data by tabs
  const values = data.toString().split("\t");

  // Define headers to map values
  const headers = [
    "Date",
    "Day",
    "Network",
    "Offer Name",
    "@",
    "Inbox",
    "NC",
    "L",
    "$",
    "EPC",
    "eCPM",
    "Conv",
    "CTR",
    "From",
    "Subject",
    "Sub ID",
  ];

  // Create an object to store parsed data
  const parsedData = {};

  // Map values to headers
  headers.forEach((header, index) => {
    parsedData[header] = values[index] || null;
  });

  return parsedData;
}

function parseDate(dateString) {
  const [day, month] = dateString.split("/").map(Number);

  if (!day || !month || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Invalid date: ${dateString}`);
  }

  return { day, month };
}
