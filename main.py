import cv2
from src.camera import Camera
from src.recognizer import FaceRecognizer

def main():
    print("Iniciando Módulo de Reconhecimento Facial...")
    recognizer = FaceRecognizer()
    
    # O "with" garante que a câmera feche se você der um Ctrl+C no terminal
    with Camera() as cam:
        print("\n=== Câmera Ativada ===")
        print("Comandos na janela de vídeo:")
        print(" [ r ] - Registrar seu rosto")
        print(" [ v ] - Testar o login (Verificar)")
        print(" [ q ] - Desligar e sair")
        print("======================\n")
        
        while True:
            frame = cam.get_frame()
            
            # Mostra a imagem em uma janela
            cv2.imshow("Sistema de Desbloqueio", frame)
            
            # Captura a tecla pressionada
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('q'):
                print("Encerrando sistema...")
                break
                
            elif key == ord('r'):
                # Pede o nome pelo terminal (Ex: Joao_Vitor)
                name = input("\nDigite o seu nome para o cadastro: ")
                recognizer.register_face(name, frame)
                
            elif key == ord('v'):
                print("\nAnalisando biometria...")
                is_match, result = recognizer.verify_face(frame)
                
                if is_match:
                    print(f"✅ ACESSO PERMITIDO! Bem-vindo(a), {result}.")
                else:
                    print(f"❌ ACESSO NEGADO! Motivo: {result}")

if __name__ == "__main__":
    main()