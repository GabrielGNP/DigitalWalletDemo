# DigitalWalletDemo

Contiene:
- API (para el funcionamiento de la generación de QRs)
    * los datos se guardan de foram estática en json durante el funcionamiento
 
- App (creada con react-expo)
    * No tiene login, solo se escribe el nombre del usuario
    * No cuenta con recarrga de saldo
    * Funcionará correctamente solo está corriendo la API, de otra forma mostrará la pantalla principal pero no podrá escanear QRs
    * Solo escanea QRs generados desde la API 
