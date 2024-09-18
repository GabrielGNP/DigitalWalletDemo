var express = require("express");
var pico = require("picocolors");
var QRCode = require('qrcode')
var pagosJson = require('./jsonDB/pagos');
const userJson = require("./jsonDB/user");

const app = express()
app.disable('x-powered-by');
const PORT = process.env.PORT ?? 5000;

app.use((req, res, next) => {
    // Permitir solicitudes desde cualquier origen
    res.setHeader('Access-Control-Allow-Origin', '*');
  
    // Permitir los métodos HTTP que se pueden utilizar en las solicitudes
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  
    // Permitir ciertos encabezados en las solicitudes
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization', 'Content-Type, ');
  
    // Permitir que las cookies se incluyan en las solicitudes (si es necesario)
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});


app.options('*', (req, res) => {
    // Respondemos con éxito a las solicitudes OPTIONS
    res.status(200).end();
});

app.use(express.json());


// #region NoRoute
app.get('/', (req, res) => {
    try {
        res.status(200).send("Funcionamiento correcto")
    } catch (error) {
        res.status(404).send("Error " + error)
    }
})

// #region GET
// ====== Mostrar pagos ======
app.get('/payment/showAll', async (req,res) =>{
    
    try {
        console.log("cargado")
        res.status(200).send(pagosJson);
    } catch (error) {
        console.error(pico.red(error));
        res.status(404).send("error" + error);
    }
});

app.get('/user/:name', async (req, res) =>{
    const userName = req.params.name;
    try {
        let user = userJson.find(p => p.name === userName);
        res.status(200).send(user);
    } catch (error) {
        console.error(pico.red(error));
        res.status(404).send("error" + error);
    }
});

app.get('/user/:name/payments', async (req,res) =>{
    const userName = req.params.name;
    const userID = userJson.find(p => p.name === userName);
    // console.log("entra al getPayments")
    try {
        // let payment = pagosJson.find(p => p.state != "pendiente")
        let payment = pagosJson.filter(p => p.state != "pendiente" && p.userID == userID.ID);
        // console.log("cargado");
        // console.log(payment);
        res.status(200).send(payment);
    } catch (error) {
        console.error(pico.red(error));
        res.status(404).send("error" + error);
    }
})

// ====== Generar QR de pago ======
app.get('/payment/generate-qr/:PaymentID', async (req,res) =>{
    const PaymentID = Number(req.params.PaymentID);
    console.log(PaymentID)
    let payment = pagosJson.find(p => p.ID === PaymentID)
    console.log(payment)
    var canvas = "<canvas></canvas>"

    if(payment != null){
        QRCode.toString(JSON.stringify(payment),{type:'terminal'}, function (err, url) {
            console.log(url)
            res.setHeader('Content-Type', 'image/png')
            // res.status(200).send(`<img src="${url}" />`);
            QRCode.toFileStream(res, JSON.stringify(payment));
          })
        // QRCode.toDataURL('payment', function (err, url) {
        //     console.log(url)
        //     res.status(200).send(url);
        //   })
    }else{
        res.status(500).send("pago no encontrado");
    }
})

// #region POST
// ====== Generar pago ======
app.post('/payment/newPayment', async (req, res) =>{
    const {
        ID,
        amount,
        category,
    } = req.body;

    const state = "pendiente";

    if(pagosJson.push({ID:ID, amount:amount, category:category, state:state})){
        res.status(200).send("OK. Payment registered: "+ JSON.stringify(pagosJson));
    }else{
        res.status(500).send("ERROR");
    }
})

app.post('/payment/process-payment', async (req, res) =>{

    const {
        ID,
        userName
    } = req.body;
    console.log(pico.magenta("procesando pago..."))
    console.log(ID)
    let payment = pagosJson.find(p => p.ID === ID);
    console.log(payment);
    if(payment && payment.state == "pendiente"){
        const userID = userJson.find(p => p.name === userName)
        if((userID.cash - payment.amount) >= 0){
            payment.state = "pagado";
            payment.userID = userID.ID;
            userID.cash = userID.cash - payment.amount;
            res.status(200).send("pagado exitosamente");
            console.log("pagado exitosamente")
        }else{
            console.log(pico.red("saldo insuficiente..."))
            res.status(409).send("No cuenta con el saldo");
        }
        
    }else{
        res.status(409).send("imposible el pago");
        console.log("Imposible el pago")
    }

    
})

// #region NoExistRoute
app.use((req, res) => {
    res.status(404).send('<h1> error 404, página no encontrada</h1>');
})

// #region Inicio de API
app.listen(PORT, () => {
    console.log(pico.bgCyan("=================")+pico.cyan(" INICIADO ")+pico.bgCyan("================="));
    console.log(pico.cyan(`server listening port: http://localhost:${PORT}`));
    console.log(pico.bgCyan("=================")+pico.cyan("  Listo   ")+pico.bgCyan("================="));   
    QRCode.toString('https://gabrielgnp.github.io/Portafolio/',{type:'terminal'}, function (err, url) {
        // console.log(url)
      })
})