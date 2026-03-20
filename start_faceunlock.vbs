Set WshShell = CreateObject("WScript.Shell")

' 1. Define a pasta raiz do projeto como diretório de trabalho (Crucial para achar o vault.json e os logs)
WshShell.CurrentDirectory = "C:\FaceUnlock\RECONHECIMENTOFACIAL_WINDOWS"

' 2. Executa a versão INVISÍVEL do Python (pythonw.exe) passando o servidor
' O "0" no final significa "Esconder a Janela"
WshShell.Run "C:\FaceUnlock\RECONHECIMENTOFACIAL_WINDOWS\.venv\Scripts\pythonw.exe -m src.server", 0, False