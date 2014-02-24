# What is this?

1. Someone start a server
2. Visit the server on your web browser
3. Connect with a phone to use it as a controller
4. Bonus: Sends device orientation/acceleration through OSC to (e.g. Max)

## Prerequisites

1. git
1. nodejs
2. npm
3. Bonus: Max MSP, odot

## How to run?

    1. git clone https://github.com/Multimedia-Orchestra/musico
    2. npm install
    3. node app.js

After that,

4. Visit ```localhost``` on your web browser. You should hear a sound.
5. Find your local IP address
6. Have people visit your local IP address on your mobile phone; all of the devices will connect together and interact with each other
7. Server will send out osc bundles that look like
<pre>
/acceleration 0.0 0.0 0.0
/accelerationIncludingGravity 0.0 0.0 9.8
/timeStamp 193593523
</pre>
through udp on ```localhost:3333```. All updates from all phones will be sent, with no namespacing/differentiation of different phones (yet).

### Help!

Email me at hellocharlien@hotmail.com for any questions :)
