import os
import pickle
import cv2
import face_recognition
import numpy as np
from src.config import FACES_DIR, TOLERANCE

class FaceRecognizer:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_names = []
        self.load_faces()

    def load_faces(self):
        """Carrega os vetores biométricos (encodings) salvos do disco para a memória."""
        self.known_face_encodings = []
        self.known_face_names = []
        
        for filename in os.listdir(FACES_DIR):
            if filename.endswith(".pkl"):
                name = filename.split(".")[0]
                filepath = os.path.join(FACES_DIR, filename)
                with open(filepath, 'rb') as f:
                    encoding = pickle.load(f)
                    self.known_face_encodings.append(encoding)
                    self.known_face_names.append(name)
                    
        print(f"[Sistema] {len(self.known_face_names)} rosto(s) carregado(s) na memória.")

    def register_face(self, name: str, frame: np.ndarray) -> bool:
        """Extrai o rosto do frame, converte em um vetor matemático e salva no disco."""
        # OpenCV usa BGR, mas a biblioteca face_recognition exige RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        
        if not face_locations:
            print("[Erro] Nenhum rosto detectado. Tente ficar mais visível na câmera.")
            return False
            
        if len(face_locations) > 1:
            print("[Erro] Mais de um rosto detectado. Fique sozinho no quadro para o cadastro.")
            return False

        # Extrai a matriz matemática (encoding) do rosto
        face_encoding = face_recognition.face_encodings(rgb_frame, face_locations)[0]
        
        # Salva a matriz no disco em formato pickle (binário)
        filepath = os.path.join(FACES_DIR, f"{name}.pkl")
        with open(filepath, 'wb') as f:
            pickle.dump(face_encoding, f)
            
        print(f"[Sucesso] Biometria de '{name}' registrada com sucesso!")
        self.load_faces()  # Atualiza a memória
        return True

    def verify_face(self, frame: np.ndarray) -> tuple[bool, str]:
        """Compara o rosto atual com os vetores salvos."""
        if not self.known_face_encodings:
            return False, "Nenhum rosto cadastrado no banco de dados."

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        
        if not face_locations:
            return False, "Nenhum rosto encontrado na câmera."

        # Pega apenas o primeiro rosto que aparecer na câmera para tentar o login
        face_encoding = face_recognition.face_encodings(rgb_frame, face_locations)[0]
        
        # Compara com os rostos conhecidos usando a tolerância definida no .env
        matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding, tolerance=TOLERANCE)
        face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
        
        if len(face_distances) == 0:
            return False, "Erro ao calcular distância biométrica."

        # Pega o rosto com a menor "distância matemática" (o mais parecido)
        best_match_index = np.argmin(face_distances)
        if matches[best_match_index]:
            name = self.known_face_names[best_match_index]
            return True, name
            
        return False, "Rosto não reconhecido."