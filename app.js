const LEDS = require('rpi-ws281x-native');
const events = require('events');
const express = require('express');
let app = express();
const http = require('http').Server(app);
const handler = new events.EventEmitter();

const NUM_LEDS = 28;
const PORT = 5000;
const DEFAULT_BRIGHTNESS = 30;
let pixelData = new Uint32Array(NUM_LEDS);

console.log(`The party is happening at ${PORT}`);
http.listen(PORT);


LEDS.init(NUM_LEDS);
LEDS.setBrightness(DEFAULT_BRIGHTNESS);
console.log('This is where the fun begins');

function shutdown() {
    console.log('Shutting down Server');
    http.close();
    console.log('Server shut down');
    console.log('Resetting LEDs');
    LEDS.reset();
    console.log('LEDs reset');
    console.log('Popping off like some pop off backstroke');
    process.exit(0);
}

// Clear all LEDS before exiting program
process.on('SIGINT', () => {
    shutdown();
});

process.on('exit', () => {
    shutdown();
});

// LED Related Functions

function rgb2Int(r, g, b) {
    return ((r & 0xff) << 16) + ((g & 0xff) << 8) + ((b & 0xff));
}

function setLed(id, r, g , b) {
    let color = rgb2Int(r,g,b);
    pixelData[id] = color;
    LEDS.render(pixelData);
}

function setRange(from, to, r, g , b) {
    let color = rgb2Int(r,g,b);
    console.log('color set');
    for (let i = from; i<= to; i++) {
        pixelData[i] = color;
        console.log(`Sucessfully set ${i}`);
    }
    LEDS.render(pixelData);
    console.log('Lets blow this popsicle stand');
 }

function setBrightness(brightness) {
    LEDS.setBrightness(brightness);
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

app.get('/setBrightness', (req, res) => {
    let b = req.query.value;
    LEDS.setBrightness(b);
    sendGoodStaatus(req, res);
});

app.get('/setLed', (req, res) => {
    let id = parseInt(req.query.id);
    let r = req.query.r;
    let g = req.query.g;
    let b = req.query.b;
    if (!id) {
        console.log('Who do you know here?');
        sendGoodStatus(req,res);
        return;
    }
    console.log(`Setting LED ${id} to RGB ${r} ${g} ${b}`);
    setLed(id,r,g,b);
    sendGoodStatus(req, res);
});

app.get('/reset', (req, res) => {
    setRange(0,27,0,0,0,30);
    sendGoodStatus(req,res);
});

app.get('/setRange', (req, res) => {
    let from = req.query.from;
    let to = req.query.to;
    let r = req.query.r;
    let g = req.query.g;
    let b = req.query.b;
    if (from < 0 || to >= NUM_LEDS) {
        console.log('Wrong housue dude');
        sendGoodStatus(req, res);
        return;
    }
    setRange(from,to,r,g,b);
    sendGoodStatus(req, res);
});
