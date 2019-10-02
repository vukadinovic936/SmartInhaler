Java MC w/ Sensirion driver + Java for Android/iOS app
=======================


What Is This?
This is smart inhaler project

Equipment used:
EK P4 KIT (Sensirion SDP3x, pipe and USB cable)
PIXL.js ESPRUINO MICROCONTROLLER

How To Use The Examples
-----------------------

1.Download mobile App on Google Play and App store

2.Connect to the microcontroller with bluetooth

3.Blow into the pipe to get results

4.Follow your results daily


How does it work
--------------------------

Sensor is getting the results and sending it to the microcontroller in 3 words.
1st word is differential pressure
2nd word is temperature
3rd word is scale
we take the differential pressure and display it
we convert the differential pressure to air flow
by derriving it from ideal gas formula
Finally microcontroller connects to mobile phone via bluetooth
Mobile phone is receiving information micocontroller sends
It displays info and makes a graph out of it
