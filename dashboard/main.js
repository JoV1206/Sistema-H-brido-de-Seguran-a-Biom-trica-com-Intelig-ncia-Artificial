const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const net = require('net'); 

// ==========================================================
// MÁGICA DE PASTAS: Resolver o universo paralelo do .exe Portátil
// ==========================================================
let PYTHON_DIR = path.join(__dirname, '..'); // Modo desenvolvedor (npm start)

if (app.isPackaged) {
    // Se for o .exe, pega a pasta real onde você deu o duplo clique (ex: pasta dist) e volta duas pastas para trás
    const exeDir = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(app.getPath('exe'));
    PYTHON_DIR = path.join(exeDir, '..', '..');
}

const LOGS_DIR = path.join(PYTHON_DIR, 'logs');
const VAULT_FILE = path.join(PYTHON_DIR, 'vault.json');
const DATASET_DIR = path.join(PYTHON_DIR, 'data', 'faces');
const ADMIN_FILE = path.join(PYTHON_DIR, 'admin.json'); 

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Face ID Admin",
        icon: path.join(__dirname, 'assets', 'icon.ico'), 
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
    //win.webContents.openDevTools(); // Deixamos o Console comentado para não abrir no aplicativo final
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// ==========================================================
// ROTAS DE COMUNICAÇÃO (BLINDADAS COM TRY/CATCH)
// ==========================================================

ipcMain.handle('get-logs', async () => {
    if (!fs.existsSync(LOGS_DIR)) return [];
    const files = fs.readdirSync(LOGS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    let logs = [];
    for (const file of jsonFiles) {
        try {
            const rawData = fs.readFileSync(path.join(LOGS_DIR, file), 'utf-8');
            const logData = JSON.parse(rawData);
            if (logData.foto_arquivo) {
                const imagePath = path.join(LOGS_DIR, logData.foto_arquivo);
                if (fs.existsSync(imagePath)) {
                    const imageBuffer = fs.readFileSync(imagePath);
                    logData.foto_base64 = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
                }
            }
            logs.push(logData);
        } catch (error) {}
    }
    return logs.reverse(); 
});

ipcMain.handle('get-users', async () => {
    if (!fs.existsSync(VAULT_FILE)) return {};
    try { return JSON.parse(fs.readFileSync(VAULT_FILE, 'utf-8')); } 
    catch (error) { return {}; }
});

ipcMain.handle('save-user', async (event, username, password) => {
    let vault = {};
    if (fs.existsSync(VAULT_FILE)) {
        try { vault = JSON.parse(fs.readFileSync(VAULT_FILE, 'utf-8')); } catch (e) {}
    }
    vault[username] = password;
    fs.writeFileSync(VAULT_FILE, JSON.stringify(vault, null, 4), 'utf-8');
    return true;
});

ipcMain.handle('delete-user', async (event, username) => {
    if (!fs.existsSync(VAULT_FILE)) return false;
    let vault = {};
    try { vault = JSON.parse(fs.readFileSync(VAULT_FILE, 'utf-8')); } catch (e) { return false; }
    delete vault[username];
    fs.writeFileSync(VAULT_FILE, JSON.stringify(vault, null, 4), 'utf-8');
    return true;
});

ipcMain.handle('delete-log', async (event, filename) => {
    try {
        const jsonPath = path.join(LOGS_DIR, filename);
        const imagePath = path.join(LOGS_DIR, filename.replace('.json', '.jpg'));
        if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        return true;
    } catch (error) { return false; }
});

ipcMain.handle('identify-log', async (event, filename, newName) => {
    try {
        const jsonPath = path.join(LOGS_DIR, filename);
        if (fs.existsSync(jsonPath)) {
            let logData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
            logData.usuario_identificado = newName;
            fs.writeFileSync(jsonPath, JSON.stringify(logData, null, 4), 'utf-8');
            return true;
        }
        return false;
    } catch (error) { return false; }
});

// AQUI ESTAVA O BUG DO BACKEND! 
ipcMain.handle('save-new-face', async (event, name, base64Data) => {
    try {
        // O { recursive: true } obriga o Windows a criar a pasta 'data' e a 'faces' juntas se não existirem
        if (!fs.existsSync(DATASET_DIR)) {
            fs.mkdirSync(DATASET_DIR, { recursive: true });
        }
        
        const base64Image = base64Data.replace(/^data:image\/jpeg;base64,/, "");
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${safeName}.jpg`;
        const filePath = path.join(DATASET_DIR, fileName);
        
        fs.writeFileSync(filePath, base64Image, 'base64');
        return true;
    } catch (error) {
        console.error("Erro ao salvar biometria:", error);
        return false;
    }
});

ipcMain.handle('clear-logs', async () => {
    try {
        if (!fs.existsSync(LOGS_DIR)) return true;
        const files = fs.readdirSync(LOGS_DIR);
        for (const file of files) { fs.unlinkSync(path.join(LOGS_DIR, file)); }
        return true;
    } catch (error) { return false; }
});

ipcMain.handle('get-profiles', async () => {
    if (!fs.existsSync(DATASET_DIR)) return [];
    try {
        const files = fs.readdirSync(DATASET_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png'));
        let profiles = [];
        for (const file of files) {
            const imgBuffer = fs.readFileSync(path.join(DATASET_DIR, file));
            const base64 = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;
            const name = file.replace(/\.[^/.]+$/, ""); 
            profiles.push({ filename: file, name: name, image: base64 });
        }
        return profiles;
    } catch (error) { return []; }
});

ipcMain.handle('delete-profile', async (event, filename) => {
    try {
        const filePath = path.join(DATASET_DIR, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return true;
    } catch (error) { return false; }
});

// ==========================================================
// ROTAS DE LOGIN E SEGURANÇA DO ADMIN
// ==========================================================

ipcMain.handle('has-admin-pass', () => fs.existsSync(ADMIN_FILE));

ipcMain.handle('set-admin-pass', (event, pass) => {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify({ password: pass }));
    return true;
});

ipcMain.handle('check-admin-pass', (event, pass) => {
    if (!fs.existsSync(ADMIN_FILE)) return false;
    const data = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));
    return data.password === pass;
});

ipcMain.handle('verify-biometrics-admin', async () => {
    return new Promise((resolve) => {
        const client = net.createConnection('\\\\.\\pipe\\FaceUnlockPipe', () => {
            client.write('VERIFY_USER\0'); 
        });
        
        client.on('data', (data) => {
            const msg = data.toString();
            client.end();
            if (msg.includes('ACCESS_GRANTED')) resolve(true);
            else resolve(false);
        });
        
        client.on('error', (err) => { resolve('OFFLINE'); });
    });
});