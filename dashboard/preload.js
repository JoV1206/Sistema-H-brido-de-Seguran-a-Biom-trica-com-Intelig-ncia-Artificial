const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getLogs: () => ipcRenderer.invoke('get-logs'),
    getUsers: () => ipcRenderer.invoke('get-users'),
    saveUser: (username, password) => ipcRenderer.invoke('save-user', username, password),
    deleteUser: (username) => ipcRenderer.invoke('delete-user', username),
    deleteLog: (filename) => ipcRenderer.invoke('delete-log', filename),
    identifyLog: (filename, newName) => ipcRenderer.invoke('identify-log', filename, newName),
    saveNewFace: (name, base64Data) => ipcRenderer.invoke('save-new-face', name, base64Data),
    clearLogs: () => ipcRenderer.invoke('clear-logs'),
    getProfiles: () => ipcRenderer.invoke('get-profiles'),
    deleteProfile: (filename) => ipcRenderer.invoke('delete-profile', filename),
    
    // NOVAS ROTAS DE LOGIN
    hasAdminPass: () => ipcRenderer.invoke('has-admin-pass'),
    setAdminPass: (pass) => ipcRenderer.invoke('set-admin-pass', pass),
    checkAdminPass: (pass) => ipcRenderer.invoke('check-admin-pass', pass),
    verifyBiometricsAdmin: () => ipcRenderer.invoke('verify-biometrics-admin')
});