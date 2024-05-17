

let port;
let reader;
let isPortOpen = false;

var connect = 0;
var frequency = parseInt(document.getElementById("freq").value);
//var resolution = parseInt(document.getElementById("reso").value);
var resolution ;

var dutyCycle = parseInt(document.getElementById("duty").value);
var dutyCycle_real;
var pin1 = parseInt(document.getElementById("pin1").value);
var pin2 = parseInt(document.getElementById("pin2").value);

var labelStart = document.getElementById("bt_start");
//var response = document.getElementById("response");
//var textResponse = "";

const connectButton = document.getElementById ('SerialConnectBt');
const serial_speed = 115200;
connectButton.addEventListener('click', connectToSerial );
var newArray;
const freq_0 = 10000;
const reso_0 = 8;
const duty_0 = 128

var toggle_code = document.getElementById('toggleCode');
toggle_code.addEventListener('click', code_out);
var toggle_YvsX = document.getElementById('toggleXY');
toggle_YvsX.addEventListener('click', plotXY_out);
code_out();


/*applyOrientation();

window.onresize = function(event) {
        applyOrientation();
    }

function applyOrientation() {
    
var my_element = document.getElementById("plot_data");

    my_element.scrollIntoView({
  behavior: "smooth",
  block: "start",
  inline: "nearest"
});
}
*/
   

async function connectToSerial() {
    try {
        document.getElementById('freq').value = freq_0;
        document.getElementById('reso').value = reso_0;
        document.getElementById('duty').value = duty_0;
        parameters ();

        // Si el puerto ya está abierto, lo cerramos
        if (isPortOpen) {
            await closeSerialPort();
            return;
        }

        if (!port) {
            // Solicitar permiso para acceder al puerto serie
            port = await navigator.serial.requestPort();
        }
        await port.open({ baudRate: [serial_speed],bufferSize: 1024  }); // Puedes cambiar la velocidad de baudios según necesites

        reader = port.readable.getReader();


        connectButton.value = 'Disconnect';
       connect = 1;
       console.log("connect = "+ connect);
       //textResponse = "";

        isPortOpen = true;
        document.getElementById('freq').value = freq_0;
        document.getElementById('reso').value = reso_0;
        document.getElementById('duty').value = duty_0;
        parameters ();


        


    } catch (error) {
        console.error('Error:', error);
    }
}
async function readSerialData() {
     
    try {
        const { value, done } = await reader.read();
        if (!done) {
            chunk = new TextDecoder().decode(value); 
            textResponse += chunk;
            response.textContent = textResponse;

            console.log(chunk);
            }
            
        


    } catch (error) {
    
        console.error('Error:', error);
    }

}

async function closeSerialPort() {

    try {
        //clearInterval(readingInterval);

        if (reader) {
            await reader.cancel();
            await reader.releaseLock();
        }

        if (port) {
            await port.close();
        }

    
        connectButton.value = 'Connect';
        //textResponse = "";
        //response.textContent = textResponse;

        isPortOpen = false;
        connect = 0;
      

    } catch (error) {
        console.error('Error:', error);
    }
}

parameters();




function updatePlot(){

    
    dutyCycle = parseInt(document.getElementById("duty").value);
    var X = [];
    var Y = [];
    var T_range = 10/frequency; // in seconds
    var Yavg = [];
    for (var i = 0; i <= 10000; i++) {
        
      X.push(parseFloat(i/frequency));
      if (i%1000<= dutyCycle/Math.pow(2, resolution)*1000){
        Y.push(3.3);
      } else {
        Y.push(0);
      }
      Yavg.push(3.3*dutyCycle/Math.pow(2, resolution))
    }
    

    var trace = {
    x: X,
    y: Y,
    type: 'scatter',
  mode: 'lines',
  name: 'Vout',
    line: {
    color: 'green',
    width: 2,
    dash: 'line'
  }
};
var traceAvg = {
    x: X,
    y: Yavg,
    type: 'scatter',
  mode: 'lines',
  name: 'Vavg',
    line: {
    color: 'blue',
    width: 2,
    dash: 'line'
  }
};


    



    var data =[trace,traceAvg]
    var layout = {
              xaxis: {
                  //   range: [0, 4095],
                  title: "Time (ms)"
              },
              yaxis: {
                  //    range: [-1, 1],
                  title: "Voltage (V)" 
              },
              title: "Output Voltage on Pins " + String(pin1) + " and "+  String(pin2) + " and Average",font: {
    family: 'Arial, sans-serif;',
    size: 18,
    color: '#000'
  },
          };


    


    Plotly.purge("plot_dataXY");
    Plotly.newPlot("plot_dataXY", data, layout);

}
function code_out(){
var codeOut = document.getElementById("code");
if (codeOut.style.display === "none") {
    codeOut.style.display = "block";
  } else {
    codeOut.style.display = "none";
  }
}

function parameters(){
    console.log("Parameters .......................");

//labelStart.value = "Start";
    frequency = parseInt(document.getElementById("freq").value);
    pin1 = parseInt(document.getElementById("pin1").value);
    pin2 = parseInt(document.getElementById("pin2").value);

var resoNewMax = Math.floor(Math.log2(80000000/frequency));
var resoNewMin = Math.ceil(Math.log2(80000000/(1023+255/256)/frequency));
if (resoNewMax > 20){resoNewMax = 20;}
if (resoNewMin < 1){resoNewMin = 1;} // See ref. on html


console.log("resoNewMax = "+ resoNewMax );
console.log("resoNewMin = "+ resoNewMin );


let labelElement = document.getElementById("resolutionsLabel");
      labelElement.innerText = "Resolutions Allowed: " +String(resoNewMin) +"-"+String(resoNewMax);
resolution = parseInt(document.getElementById("reso").value);

const duty_max = Math.pow(2, resolution);

let labelElement2 = document.getElementById("dutyLabel");
labelElement2.innerText = "Duty Cycle (0-" +String(duty_max-1)+"):";
dutyCycle = parseInt(document.getElementById("duty").value);

//dutyCycle_real = parseInt(duty_max*dutyCycle/100);

//dutyCycle_real = parseInt(duty_max*dutyCycle/100);
console.log("dutyCycle = " + dutyCycle);
if  ((frequency>40000000 || frequency<10) || (resolution>resoNewMax || resolution<resoNewMin)|| (dutyCycle>duty_max -1|| dutyCycle<0)){
    alert("Check that all parameters are in allowed ranges");
} else {updatePlot();
}
}

async function send_freq(){
    parameters();
    if (connect == 1){
    try {
        const newVal = String(document.getElementById("freq").value);
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode('freq:' +newVal));
        await writer.releaseLock();
        console.log('Datos enviados con éxito');
        console.log(newVal); 
      } catch (error) {
        console.error('Error al enviar datos por el puerto serie:', error);
      }
    }
}   


async function send_reso(){
        parameters();

        
        if (connect == 1){

    try {
        const newVal = String(document.getElementById("reso").value);
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode('reso:' +newVal));
        await writer.releaseLock();
        console.log('Datos enviados con éxito');
        console.log(newVal);
      } catch (error) {
        console.error('Error al enviar datos por el puerto serie:', error);
      }
  }
}

async function send_duty(){
        parameters();
        if (connect == 1){

    try {
        const newVal = String(document.getElementById("duty").value);
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode('duty:' +newVal));
        await writer.releaseLock();
        console.log('Datos enviados con éxito');
        console.log(newVal); 
      } catch (error) {
        console.error('Error al enviar datos por el puerto serie:', error);
      }
  }
}

async function send_pin1(){
        parameters();
        if (connect == 1){

    try {
        const newVal = String(document.getElementById("pin1").value);
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode('pin1:' +newVal));
        await writer.releaseLock();
        console.log('Datos enviados con éxito');
        console.log(newVal); 
      } catch (error) {
        console.error('Error al enviar datos por el puerto serie:', error);
      }
  }
}

async function send_pin2(){
        parameters();
        if (connect == 1){

    try {
        const newVal = String(document.getElementById("pin2").value);
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode('pin2:' +newVal));
        await writer.releaseLock();
        console.log('Datos enviados con éxito');
        console.log(newVal); 

      } catch (error) {
        console.error('Error al enviar datos por el puerto serie:', error);
      }
  }
}

async function send_start(){
    if (connect == 1){

    try {
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode('start'));
        await writer.releaseLock();
        console.log('Datos enviados con éxito');
      } catch (error) {
        console.error('Error al enviar datos por el puerto serie:', error);
      }
  }
}

async function send_stop(){
if (connect == 1){
    try {
        const writer = port.writable.getWriter();
        await writer.write(new TextEncoder().encode('stop'));
        await writer.releaseLock();
        console.log('Datos enviados con éxito');  
      } catch (error) {
        console.error('Error al enviar datos por el puerto serie:', error);
      }
  }
}

function start(){


    if (labelStart.value == "Start"){
        send_start();
        labelStart.value = "Stop";
    } else if (labelStart.value == "Stop"){
        send_stop();
        labelStart.value = "Start";
    }

}

function plotXY_out(){
var plotOut = document.getElementById("plot_dataXY");
if (plotOut.style.display === "none") {
    plotOut.style.display = "block";
  } else {
    plotOut.style.display = "none";
  }
}
