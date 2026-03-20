// ==========================================
// 1. LISTAGEM DO COFRE (vault.json)
// ==========================================
async function loadUsers() {
    const list = document.getElementById('users-list');
    list.innerHTML = '<p>A carregar o cofre...</p>';

    const users = await window.api.getUsers();
    list.innerHTML = '';

    if (Object.keys(users).length === 0) {
        list.innerHTML = '<p>O cofre está vazio. Adicione um utilizador no botão acima.</p>';
        return;
    }

    for (const [username, password] of Object.entries(users)) {
        const row = document.createElement('div');
        row.className = 'user-row';
        row.innerHTML = `
            <div>
                <strong>👤 ${username}</strong><br>
                <small style="color: var(--text-muted)">Palavra-passe encriptada salva (••••••••)</small>
            </div>
            <button class="danger-btn" onclick="deleteUser('${username}')">Excluir Acesso</button>
        `;
        list.appendChild(row);
    }
}

window.deleteUser = async (username) => {
    if (confirm(`Tem a certeza que deseja remover o acesso de ${username}? A senha será apagada.`)) {
        await window.api.deleteUser(username);
        loadUsers();
    }
};

// ==========================================
// 2. CÂMARA E CADASTRO UNIFICADO
// ==========================================
const cameraModal = document.getElementById('camera-modal');
const videoElement = document.getElementById('webcam-video');
const canvasElement = document.getElementById('webcam-canvas');
let stream = null; 

document.getElementById('btn-open-camera')?.addEventListener('click', async () => {
    // Limpa os campos de texto antes de abrir
    document.getElementById('new-face-name').value = '';
    document.getElementById('new-face-pass').value = '';
    cameraModal.classList.add('active');
    
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoElement.srcObject = stream;
    } catch (err) {
        alert("Erro ao aceder à câmara: " + err.message);
        cameraModal.classList.remove('active');
    }
});

document.getElementById('btn-cancel-camera')?.addEventListener('click', () => {
    cameraModal.classList.remove('active');
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
});

// A Grande Mágica: Salva a Foto e a Senha de uma só vez!
document.getElementById('btn-capture-face')?.addEventListener('click', async () => {
    const name = document.getElementById('new-face-name').value.trim();
    const pass = document.getElementById('new-face-pass').value.trim();

    if (!name || !pass) {
        return alert("Por favor, preencha o Nome e a Senha do Windows!");
    }

    // Tira a foto da câmara
    const context = canvasElement.getContext('2d');
    canvasElement.width = videoElement.videoWidth || 640;
    canvasElement.height = videoElement.videoHeight || 480;
    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    const base64Image = canvasElement.toDataURL('image/jpeg', 0.9);

    try {
        // 1. Guarda o Rosto para a Inteligência Artificial (data/faces)
        const faceSuccess = await window.api.saveNewFace(name, base64Image);
        
        if (faceSuccess) {
            // 2. Guarda a Senha no Cofre (vault.json) para o Windows
            await window.api.saveUser(name, pass);
            
            alert(`Usuário '${name}' cadastrado com sucesso na IA e no Cofre!`);
            document.getElementById('btn-cancel-camera').click(); // Fecha e desliga câmara
            loadUsers(); // Atualiza a lista na tela
        } else {
            alert("A foto não foi guardada. Erro no Backend.");
        }
    } catch (error) {
        alert("Erro de comunicação com o sistema.");
        console.error(error);
    }
});

// ==========================================
// 3. GALERIA DE PERFIS BIOMÉTRICOS
// ==========================================
const profilesModal = document.getElementById('profiles-modal');

document.getElementById('btn-view-profiles')?.addEventListener('click', () => {
    profilesModal.classList.add('active');
    loadProfiles();
});

document.getElementById('btn-close-profiles')?.addEventListener('click', () => {
    profilesModal.classList.remove('active');
});

async function loadProfiles() {
    const container = document.getElementById('profiles-grid');
    container.innerHTML = '<p>A carregar os rostos conhecidos pela IA...</p>';
    
    try {
        const profiles = await window.api.getProfiles();
        if (!profiles || profiles.length === 0) {
            container.innerHTML = '<p style="grid-column: 1 / -1;">Nenhuma face registada na base de dados.</p>';
            return;
        }
        
        container.innerHTML = '';
        profiles.forEach(p => {
            const div = document.createElement('div');
            div.className = 'profile-card';
            div.innerHTML = `
                <img src="${p.image}" alt="Rosto de ${p.name}">
                <p style="margin-top:8px; font-weight:bold; font-size:0.9rem; overflow:hidden; text-overflow:ellipsis;">${p.name}</p>
                <button class="danger-btn" style="width:100%; margin-top:10px; padding:5px; font-size:0.8rem;" onclick="deleteFaceProfile('${p.filename}')">Excluir</button>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        container.innerHTML = '<p style="color:red;">Erro ao carregar a galeria.</p>';
    }
}

window.deleteFaceProfile = async (filename) => {
    if (confirm(`Pretende mesmo eliminar a face "${filename}"?`)) {
        const sucesso = await window.api.deleteProfile(filename);
        if (sucesso) loadProfiles();
        else alert("Falha ao apagar o ficheiro da imagem.");
    }
};

window.addEventListener('DOMContentLoaded', loadUsers);