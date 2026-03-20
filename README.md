
# 🛡️ Face ID Windows Security System

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10+-yellow.svg)
![Node.js](https://img.shields.io/badge/Node.js-Electron-green.svg)
![ONNX](https://img.shields.io/badge/ONNX-Runtime-orange.svg)

Um sistema avançado de segurança biométrica híbrida. Este projeto integra um motor de Inteligência Artificial em Python (para Reconhecimento Facial e Anti-Spoofing) com um Painel de Administração moderno construído em Node.js e Electron, comunicando via *Named Pipes* no Windows.

## ✨ Funcionalidades

* **Reconhecimento Facial de Alta Precisão:** Identificação de utilizadores autorizados utilizando mapeamento vetorial.
* **Sistema Anti-Spoofing (Liveness Detection):** Proteção rigorosa contra fraudes por fotos, telas de telemóvel ou máscaras. Utiliza a rede neural **MiniFASNetV2** (processada via ONNX Runtime) combinada com deteção de piscar de olhos para garantir que um rosto humano real está presente.
* **Painel de Controlo Administrativo (Electron):** Interface gráfica para gestão do cofre de senhas e biometrias.
* **Auditoria e Logs de Intrusão:** Registo detalhado de todas as tentativas de acesso, capturando foto do invasor, data, hora, IP público e localização aproximada.
* **Comunicação Inter-Processos (IPC):** Arquitetura segura baseada em `Named Pipes` (`\\.\pipe\FaceUnlockPipe`), isolando o motor de IA da interface de rede.

## 🏗️ Arquitetura do Sistema

O projeto é dividido em dois módulos principais que correm em paralelo:

1. **Motor IA (Backend - Python):** Responsável por aceder à câmara, processar os vetores faciais, detetar vivacidade (Anti-Spoofing + Blink) e executar o desbloqueio a nível de SO.
2. **Dashboard (Frontend - Electron/Node.js):** Interface de gestão administrativa. Só pode ser acedida mediante autenticação por Senha Mestre ou Biometria do Administrador.

## 🚀 Como Executar Localmente

### Pré-requisitos
* Python 3.10 ou superior
* Node.js e NPM instalados
* Ambiente Windows

### 1. Iniciar o Motor Python (Cérebro IA)
Abra um terminal na raiz do projeto e execute:
```bash
# Ativar o ambiente virtual (Recomendado)
# Instalar dependências
pip install opencv-python numpy face_recognition requests scipy onnxruntime

# Iniciar o Servidor Híbrido
python server.py
2. Iniciar o Painel Administrativo (Electron)
Abra um segundo terminal com privilégios de Administrador, navegue para a pasta dashboard e execute:
_________________________________________________________________________________________________________________________________________
Bash
cd dashboard
npm install
npm start
📦 Compilar o Executável
Para gerar o ficheiro .exe portátil do painel de administração:
_________________________________________________________________________________________________________________________________________
Bash
cd dashboard
npm run dist
O executável final estará disponível na pasta dashboard/dist/.
_________________________________________________________________________________________________________________________________________
🔒 Segurança e Privacidade
Este projeto lida com dados sensíveis (senhas e vetores biométricos). Por razões de segurança, as seguintes pastas são estritamente locais e estão ignoradas no repositório (.gitignore):

vault.json e admin.json (Cofres de credenciais)

data/faces/ (Base de dados biométrica)

logs/ (Histórico e fotos de intrusão)
_________________________________________________________________________________________________________________________________________
📚 Agradecimentos e Referências Técnicas
A deteção de Anti-Spoofing (identificação de Rostos Falsos vs Reais) deste sistema foi construída utilizando a inferência ONNX do modelo MiniFASNetV2 (scale 2.7).

Os pesos e a arquitetura base para a inferência foram fornecidos pelo excelente repositório yakhyo/face-anti-spoofing.

* O desenvolvimento da arquitetura de integração (IPC), otimização de scripts e resolução de bugs foi realizado com o auxílio de Inteligência Artificial atuando como *pair programmer*, acelerando o ciclo de desenvolvimento e a implementação de boas práticas de código.
_________________________________________________________________________________________________________________________________________
👨‍💻 Autor
Feito com ☕ por João Vitor Almeida Teodoro

✉️ E-mail: joao.vitor43592@gmail.com

🐙 GitHub: [https://github.com/JoV1206]

💼 LinkedIn: [www.linkedin.com/in/joão-vitor-almeida-teodoro-954a11268]
__________________________________________________________________________________________________________________________________________
Este projeto está sob a licença MIT - veja o ficheiro LICENSE para mais detalhes.