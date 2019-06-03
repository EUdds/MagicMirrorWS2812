const LEDS = require('rpi-ws281x-native');
const events = require('events');
const express = require('express');
let app = express();
const http = require('http').Server(app);
const handler = new events.EventEmitter();

const NUM_LEDS = 28;
const PORT = 5000;
let pixelData = new Uint32Array(NUM_LEDS);

console.log(`The party is happening at ${PORT}`);
http.listen(PORT);


LEDS.init(NUM_LEDS);
console.log('This is where the fun begins');

// Clear all LEDS before exiting program
process.on('SIGINT', () => {
    LEDS.reset();
    process.nextTick(() => { process.exit(0);});
});

process.on('exit', () => {
    LEDS.reset();
    process.nextTick(() => { process.exit(0);});
});

// LED Related Functions

function rgb2Int(r, g, b) {
    return ((r & 0xff) << 16) + ((g & 0xff) << 8) + ((b & 0xff));
}

function setLed(id, r, g , b, brightness) {
    LEDS.setBrightness(brightness);
    let color = rgb2Int(r,g,b);
    pixelData[id] = color;
    LEDS.render(pixelData);
}

function setRange(from, to, r, g , b, brightness) {
    console.log('Range time');
    LEDS.setBrightness(brightness);
    console.log('Brightness set');
    let color = rgb2Int(r,g,b);
    console.log('color set');
    for (let i = from; i<= to; i++) {
        pixelData[i] = color;
        console.log(`Sucessfully set ${i}`);
    }
    LEDS.render(pixelData);
    console.log('Lets blow this popsicle stand');
 }

// Status Updates
function sendGoodStatus(req, res) {
    res.type('application/json');
    res.send('{"status": "ok"}');
}


// Events

app.get('/test', (req, res) => {
    console.log('Oh a visitor!');
    setRange(0,27, 255, 255, 0, 30);
    console.log('DISCO!!!');
    sendGoodStatus(req, res);
    console.log('Said Goodbye');
});

app.get('/setLed', (req, res) => {
    let id = parseInt(req.query.id);
    let r = req.query.r;
    let g = req.query.g;
    let b = req.query.b;
    let brightness = req.query.bright;
    if (!id) {
        console.log('Who do you know here?');
        return
    }
    console.log(`Setting LED ${id} to RGB ${r} ${g} ${b} with a brightness of ${brightness}`);
    setLed(id,r,g,b,brightness);
    sendGoodStatus(req, res);
});

app.get('/reset', (req, res) => {
    setRange(0,27,0,0,0,30);
    sendGoodStatus(req,res);
});
