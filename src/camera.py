import cv2

class Camera:
    """
    Gerencia a captura de vídeo da webcam de forma segura.
    Usa o protocolo de Context Manager (with) para garantir a liberação do hardware.
    """
    def __init__(self, camera_index: int = 0):
        self.camera_index = camera_index
        self.cap = None

    def __enter__(self):
        """Inicializa a câmera quando entra no bloco 'with'."""
        self.cap = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW)
        
        if not self.cap.isOpened():
            raise ValueError(f"CRÍTICO: Não foi possível acessar a câmera no índice {self.camera_index}. Verifique se outro app está usando a webcam.")
        
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Garante que a câmera será desligada ao sair do bloco, mesmo em caso de erro."""
        if self.cap is not None:
            self.cap.release()
        cv2.destroyAllWindows()

    def get_frame(self):
        """Captura um único frame da câmera."""
        if self.cap is None or not self.cap.isOpened():
            raise RuntimeError("Câmera não inicializada. Certifique-se de usar a classe dentro de um bloco 'with'.")
            
        ret, frame = self.cap.read()
        
        if not ret:
            raise RuntimeError("Falha ao ler o frame da câmera. O hardware pode ter sido desconectado.")
            
        return frame