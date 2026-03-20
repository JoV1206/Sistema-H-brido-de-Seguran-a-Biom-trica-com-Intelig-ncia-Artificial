import os
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

# Validação e exportação segura das configurações
FACES_DIR = os.getenv("FACES_DIR", "data/faces")
CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", 0))
TOLERANCE = float(os.getenv("TOLERANCE", 0.4))

# Garante que o diretório de faces exista
os.makedirs(FACES_DIR, exist_ok=True)