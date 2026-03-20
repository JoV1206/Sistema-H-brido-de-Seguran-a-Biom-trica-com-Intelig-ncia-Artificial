# ==============================================================================
# Author: João Vitor Almeida
# Project: Face ID Windows Security System
# Description: Motor híbrido de reconhecimento facial e anti-spoofing
# ==============================================================================

import time
import win32pipe
import win32file
import pywintypes
import cv2
import numpy as np
import os
from scipy.spatial import distance as dist

import face_recognition
from src.camera import Camera
from src.recognizer import FaceRecognizer

import requests
import subprocess
from datetime import datetime
import json

PIPE_NAME = r'\\.\pipe\FaceUnlockPipe'
MODEL_PATH = r'C:\FaceUnlock\RECONHECIMENTOFACIAL_WINDOWS\models\minifasnetv2.onnx'

# =======================================================================
# MATEMÁTICA DO PISCAR (EAR)
# =======================================================================
def calcular_ear(olho):
    A = dist.euclidean(olho[1], olho[5])
    B = dist.euclidean(olho[2], olho[4])
    C = dist.euclidean(olho[0], olho[3])
    return (A + B) / (2.0 * C)

# =======================================================================
# DETECTOR DE TEXTURA (DNN)
# =======================================================================
class AntiSpoofingDetector:
    def __init__(self, model_path):
        if not os.path.exists(model_path):
            print(f"[Erro Crítico] Arquivo de modelo não encontrado em: {model_path}")
            exit(1)
        self.net = cv2.dnn.readNetFromONNX(model_path)
        self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
        self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
        print("[Sistema] Cérebro Anti-Spoofing (DNN) carregado.")

    def is_real_skin(self, frame, face_location):
        try:
            top, right, bottom, left = face_location
            h, w, _ = frame.shape
            top = max(0, top - 20)
            bottom = min(h, bottom + 20)
            left = max(0, left - 20)
            right = min(w, right + 20)
            
            face_bgr = frame[top:bottom, left:right]
            if face_bgr.size == 0: return False, 0
            
            blob = cv2.dnn.blobFromImage(face_bgr, 1.0/255.0, (80, 80), (0, 0, 0), swapRB=True, crop=False)
            self.net.setInput(blob)
            preds = self.net.forward()
            
            logits = preds[0]
            exp_logits = np.exp(logits - np.max(logits))
            probabilidades = exp_logits / np.sum(exp_logits)
            
            pct_real = probabilidades[2] * 100
            classe_vencedora = np.argmax(probabilidades)
            
            is_real = (classe_vencedora == 2 and pct_real >= 99.0)
            return is_real, pct_real

        except Exception as e:
            return False, 0

# =======================================================================
# MÓDULO DE AUDITORIA E TELEMETRIA (STEALTH LOGGER)
# =======================================================================
class AuditLogger:
    def __init__(self, log_dir="logs"):
        self.log_dir = log_dir
        # Cria a pasta secreta de logs se ela não existir
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir)

    def get_wifi_ssid(self):
        """Usa comandos nativos do Windows para descobrir o Wi-Fi atual."""
        try:
            output = subprocess.check_output(['netsh', 'wlan', 'show', 'interfaces']).decode('utf-8', errors='ignore')
            for line in output.split('\n'):
                if "SSID" in line and "BSSID" not in line:
                    return line.split(':')[1].strip()
        except Exception:
            pass
        return "Desconhecido/Cabeado"

    def get_location(self):
        """Faz um ping rápido e invisível para pegar o IP e a Localização."""
        try:
            # Timeout de 2 segundos para não travar o login do Windows
            res = requests.get('https://ipinfo.io/json', timeout=2).json()
            return res.get('ip', 'N/A'), res.get('city', 'N/A'), res.get('loc', 'N/A')
        except Exception:
            return "Offline", "N/A", "N/A"

    def registrar_evento(self, frame, status, motivo, usuario="Desconhecido", vetor_facial=None):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        nome_base = f"{timestamp}_{status}"

        # 1. Salva a foto silenciosamente
        caminho_foto = os.path.join(self.log_dir, f"{nome_base}.jpg")
        if frame is not None:
            cv2.imwrite(caminho_foto, frame)

        # 2. Coleta a Telemetria
        ssid = self.get_wifi_ssid()
        ip, cidade, coords = self.get_location()

        # 3. Monta o Dossiê
        dossie = {
            "data_hora": datetime.now().strftime("%d/%m/%Y %H:%M:%S"),
            "status": status,
            "motivo": motivo,
            "usuario_identificado": usuario,
            "rede_wifi": ssid,
            "ip_publico": ip,
            "cidade": cidade,
            "coordenadas_gps": coords,
            "foto_arquivo": f"{nome_base}.jpg",
            "vetor_facial": vetor_facial # NOVO CAMPO
        }

        # 4. Salva o JSON no disco
        caminho_json = os.path.join(self.log_dir, f"{nome_base}.json")
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(dossie, f, indent=4, ensure_ascii=False)

# =======================================================================
# SERVIDOR PRINCIPAL (HÍBRIDO + COFRE SEGURO + AUDITORIA)
# =======================================================================
def run_server():
    print("=== Servidor Biométrico HÍBRIDO Iniciado ===")
    recognizer = FaceRecognizer()
    spoof_detector = AntiSpoofingDetector(MODEL_PATH)
    auditoria = AuditLogger() # <-- Instanciamos o cão de guarda!
    
    # --- VARIÁVEIS DO COFRE ---
    tentativas_falhas = 0
    MAX_TENTATIVAS = 5
    tempo_bloqueio = 0
    TEMPO_DE_CASTIGO = 120 
    
    while True:
        print(f"\n[Escuta] Criando Named Pipe: {PIPE_NAME}")
        pipe = win32pipe.CreateNamedPipe(
            PIPE_NAME, win32pipe.PIPE_ACCESS_DUPLEX,
            win32pipe.PIPE_TYPE_MESSAGE | win32pipe.PIPE_READMODE_MESSAGE | win32pipe.PIPE_WAIT,
            1, 65536, 65536, 0, None
        )
        
        try:
            win32pipe.ConnectNamedPipe(pipe, None)
            hr, data = win32file.ReadFile(pipe, 1024)
            message = data.decode('utf-8').strip('\x00')
            
            if "VERIFY_USER" in message:
                
                if tentativas_falhas >= MAX_TENTATIVAS:
                    if time.time() < tempo_bloqueio:
                        # Bloqueado: Não acende a câmera, mas registra o evento
                        auditoria.registrar_evento(None, "BLOQUEADO", "Tentativa durante Lockout")
                        win32file.WriteFile(pipe, b"ACCESS_DENIED")
                        win32pipe.DisconnectNamedPipe(pipe)
                        win32file.CloseHandle(pipe)
                        continue 
                    else:
                        print("[Segurança] 🟢 Tempo de bloqueio expirado.")
                        tentativas_falhas = 0 

                print("[IA] Iniciando Trava Dupla...")
                with Camera() as cam:
                    time.sleep(0.3) 
                    
                    timeout = 10.0 
                    start_time = time.time()
                    
                    identidade_ok = False
                    textura_ok = False
                    piscou_ok = False
                    nome_usuario = ""
                    ultimo_frame_capturado = None # <-- Guarda a foto
                    
                    frames_reais = 0
                    LIMITE_EAR = 0.22
                    estado_piscar = 0 
                    
                    # Variável para guardar o vetor matemático do rosto
                    ultimo_vetor_capturado = None
                    
                    while time.time() - start_time < timeout:
                        frame = cam.get_frame()
                        ultimo_frame_capturado = frame.copy() # <-- Tira a cópia para a auditoria
                        
                        landmarks_list = face_recognition.face_landmarks(frame)
                        face_locations = face_recognition.face_locations(frame)
                        
                        if len(face_locations) > 0 and len(landmarks_list) > 0:
                            localizacao = face_locations[0]
                            marcas = landmarks_list[0]
                            
                            # === EXTRAI O VETOR FACIAL (128 dimensões) ===
                            encodings = face_recognition.face_encodings(frame, [localizacao])
                            if len(encodings) > 0:
                                ultimo_vetor_capturado = encodings[0].tolist()
                            
                            if not identidade_ok:
                                is_match, result = recognizer.verify_face(frame)
                                if is_match:
                                    identidade_ok = True
                                    nome_usuario = result
                            
                            if identidade_ok:
                                is_real, pct_real = spoof_detector.is_real_skin(frame, localizacao)
                                if is_real:
                                    frames_reais += 1
                                    if frames_reais >= 1: textura_ok = True
                                else:
                                    frames_reais = 0
                                    textura_ok = False 
                                
                                if 'left_eye' in marcas and 'right_eye' in marcas:
                                    ear_esq = calcular_ear(marcas['left_eye'])
                                    ear_dir = calcular_ear(marcas['right_eye'])
                                    media_ear = (ear_esq + ear_dir) / 2.0
                                    
                                    if estado_piscar == 0 and media_ear <= LIMITE_EAR: estado_piscar = 1 
                                    elif estado_piscar == 1 and media_ear > LIMITE_EAR:
                                        estado_piscar = 2 
                                        piscou_ok = True
                                
                                print(f"[Status] Textura: {pct_real:05.1f}% | EAR: {media_ear:.2f} | Piscou: {piscou_ok}")
                                
                                if textura_ok and piscou_ok:
                                    break

                    # --- DECISÃO FINAL COM AUDITORIA ---
                    if identidade_ok and textura_ok and piscou_ok:
                        print(f"[IA] ✅ ✅ ACESSO LIBERADO: {nome_usuario}")
                        tentativas_falhas = 0
                        
                        # Salva o log de SUCESSO
                        auditoria.registrar_evento(ultimo_frame_capturado, "SUCESSO", "Autenticação Híbrida Aprovada", nome_usuario, ultimo_vetor_capturado)
                        
                        try:
                            with open('vault.json', 'r', encoding='utf-8') as f:
                                cofre = json.load(f)
                                senha_do_usuario = cofre.get(nome_usuario, "")
                                if senha_do_usuario != "":
                                    mensagem_final = f"ACCESS_GRANTED|{senha_do_usuario}"
                                    response = mensagem_final.encode('utf-8')
                                else:
                                    response = b"ACCESS_DENIED"
                        except FileNotFoundError:
                            response = b"ACCESS_DENIED"
                            
                    else:
                        tentativas_falhas += 1
                        print(f"[IA] ❌ ❌ ACESSO NEGADO. (Tentativa {tentativas_falhas} de {MAX_TENTATIVAS})")
                        
                        # Verifica se a IA reconheceu o rosto, mesmo que o liveness (piscar) tenha falhado
                        nome_invasor = nome_usuario if identidade_ok else "Desconhecido"
                        
                        # Salva o log de INVASÃO com o nome da pessoa (se reconhecida) ou Desconhecido
                        motivo_falha = f"Id:{identidade_ok} | Tex:{textura_ok} | Pisc:{piscou_ok}"
                        auditoria.registrar_evento(ultimo_frame_capturado, "NEGADO", motivo_falha, nome_invasor, ultimo_vetor_capturado)
                        
                        if tentativas_falhas >= MAX_TENTATIVAS:
                            tempo_bloqueio = time.time() + TEMPO_DE_CASTIGO
                            
                        response = b"ACCESS_DENIED"
                        
                    win32file.WriteFile(pipe, response)

            elif "MANUAL_ENTRY" in message:
                print("[Auditoria] 🚨 Alerta de Digitação Manual! Capturando foto rápida...")
                try:
                    with Camera() as cam:
                        time.sleep(0.3) # Tempo mínimo para a lente ajustar a luz
                        frame = cam.get_frame()
                        
                        # Usa a nossa classe de auditoria para salvar o evento
                        auditoria.registrar_evento(frame, "ALERTA", "Login via Teclado (Senha Manual digitada)", "Não Biométrico", None)
                except Exception as e:
                    print(f"[Erro Auditoria] Falha ao capturar foto manual: {e}")

        except pywintypes.error as e:
            print(f"[Erro de Comunicação] Falha no pipe: {e}")
            
        except Exception as e:
            # NOVO: Se qualquer coisa der errado (ex: câmara em uso, erro matemático), 
            # ele não crasha, apenas nega o acesso e avisa o erro!
            print(f"[Erro Fatal na IA] {e}")
            try:
                win32file.WriteFile(pipe, b"ACCESS_DENIED|ERRO_INTERNO")
            except Exception:
                pass
                
        finally:
            # Fecha o cano limpo para a próxima tentativa
            try:
                win32pipe.DisconnectNamedPipe(pipe)
                win32file.CloseHandle(pipe)
            except Exception:
                pass

if __name__ == '__main__':
    run_server()