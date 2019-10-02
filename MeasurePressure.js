//Constant values that are used in code
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
var C = {
  ADDR: 0x21,  //SDP3x ADDRESS
  POLYNOMIAL: 0x31, //SDP3x CRC POLYNOMIAL
  MASS_FLOW_AVG: 0x3603, // CODE FOR STARTING MEASURING MASS FLOW AVERAGE
  MASS_FLOW:0x3608,   // CODE FOR STARTING MEASURING MASS FLOW 
  DIFF_PRESS_AVG:0x3615,  // CODE FOR STARTING DIFFERENTIAL PRESSURE AVERAGE
  DIFF_PRESS:0x361E,    // CODE FOR STARTING DIFFERENTIAL PRESSURE
  DENSITY_OF_AIR:1.225,  //APPROXIMATE DENSITY OF AIR
  RADIUS_OF_PIPE:0.015,   //RADIOUS OF PIPE
  CRC_INIT:0xFF          // CRC INITIALIZATION CODE
 
};
 var  CRC_LUT = [  0x00, 0x31, 0x62, 0x53, 0xC4, 0xF5, 0xA6, 0x97, 0xB9, 0x88, 0xDB, 0xEA, 0x7D, 0x4C, 0x1F,
          0x2E, 0x43, 0x72, 0x21, 0x10, 0x87, 0xB6, 0xE5, 0xD4, 0xFA, 0xCB, 0x98, 0xA9, 0x3E, 0x0F,
          0x5C, 0x6D, 0x86, 0xB7, 0xE4, 0xD5, 0x42, 0x73, 0x20, 0x11, 0x3F, 0x0E, 0x5D, 0x6C, 0xFB,
          0xCA, 0x99, 0xA8, 0xC5, 0xF4, 0xA7, 0x96, 0x01, 0x30, 0x63, 0x52, 0x7C, 0x4D, 0x1E, 0x2F,
          0xB8, 0x89, 0xDA, 0xEB, 0x3D, 0x0C, 0x5F, 0x6E, 0xF9, 0xC8, 0x9B, 0xAA, 0x84, 0xB5, 0xE6,
          0xD7, 0x40, 0x71, 0x22, 0x13, 0x7E, 0x4F, 0x1C, 0x2D, 0xBA, 0x8B, 0xD8, 0xE9, 0xC7, 0xF6,
          0xA5, 0x94, 0x03, 0x32, 0x61, 0x50, 0xBB, 0x8A, 0xD9, 0xE8, 0x7F, 0x4E, 0x1D, 0x2C, 0x02,
          0x33, 0x60, 0x51, 0xC6, 0xF7, 0xA4, 0x95, 0xF8, 0xC9, 0x9A, 0xAB, 0x3C, 0x0D, 0x5E, 0x6F,
          0x41, 0x70, 0x23, 0x12, 0x85, 0xB4, 0xE7, 0xD6, 0x7A, 0x4B, 0x18, 0x29, 0xBE, 0x8F, 0xDC,
          0xED, 0xC3, 0xF2, 0xA1, 0x90, 0x07, 0x36, 0x65, 0x54, 0x39, 0x08, 0x5B, 0x6A, 0xFD, 0xCC,
          0x9F, 0xAE, 0x80, 0xB1, 0xE2, 0xD3, 0x44, 0x75, 0x26, 0x17, 0xFC, 0xCD, 0x9E, 0xAF, 0x38,
          0x09, 0x5A, 0x6B, 0x45, 0x74, 0x27, 0x16, 0x81, 0xB0, 0xE3, 0xD2, 0xBF, 0x8E, 0xDD, 0xEC,
          0x7B, 0x4A, 0x19, 0x28, 0x06, 0x37, 0x64, 0x55, 0xC2, 0xF3, 0xA0, 0x91, 0x47, 0x76, 0x25,
          0x14, 0x83, 0xB2, 0xE1, 0xD0, 0xFE, 0xCF, 0x9C, 0xAD, 0x3A, 0x0B, 0x58, 0x69, 0x04, 0x35,
          0x66, 0x57, 0xC0, 0xF1, 0xA2, 0x93, 0xBD, 0x8C, 0xDF, 0xEE, 0x79, 0x48, 0x1B, 0x2A, 0xC1,
          0xF0, 0xA3, 0x92, 0x05, 0x34, 0x67, 0x56, 0x78, 0x49, 0x1A, 0x2B, 0xBC, 0x8D, 0xDE, 0xEF,
          0x82, 0xB3, 0xE0, 0xD1, 0x46, 0x77, 0x24, 0x15, 0x3B, 0x0A, 0x59, 0x68, 0xFF, 0xCE, 0x9D,
          0xAC ];
  //Proces of CRC error check
function ErrorCheck(bytes, bytesLen)
{
  var crc = C.CRC_INIT;
  var next=0;
  var success=true; // checks 3 words(pressure,temperature,scale),all of them have to return true
  // loop through every byte
  for(var i=bytesLen;i>0;i--)
  {
    //every 3rd byte is crc
    if ((i % 3) === 1)
    {
       //compare value with crc value
      success = success && (crc == bytes[next]);
      //Reinitialize it because now we need to check for errors in the next word , so we clear info from previos
      crc     = C.CRC_INIT;    
    }
      else
    {   //next byte
        crc = CRC_LUT[crc ^ bytes[next]];
    }
    next++;
  }
  //if true then no errors in connection
  return success;
   
}
function mainFunction(){
   Serial1.setup(9600, {rx:D0, tx:D1});
   Serial1.on('data', function (data) { print("<Serial> "+data); });
   var i2c= new I2C();
   i2c.setup({scl:A5,sda:A4}); //SCL and SDA are connected to ports A5 A4;
   i2c.writeTo(C.ADDR,[0x36,0x03]); // GIVE COMMAND 0x3603
   var readInfo=true;
   while(readInfo){
   if(digitalRead(BTN3)==1){
     readInfo=false;
   }
     sleep(500);
    //readFromSensor
   var result= i2c.readFrom(0x21,9);
   var pressure;
  //get pressure
  /*
    third[2], sixth[5], and ninth[8] bytes are reserved for crc
    first[0] and second[1] are returning pressure
    fourth[3] and fifth[4] are returning current temperature
    seventh[6] and eight[7] are giving scale so we can get pressure in Pascals
  */
  pressure <<= 8;
  pressure |=  result[0];
  pressure <<= 8;
  pressure |=  result[1];
  var temp;
  //get temperature
  temp <<= 8;
  temp |=  result[3];
  temp <<= 8;
  temp |=  result[4];
  var scale;
  //get scale
  scale <<= 8;
  scale |= result[6];
  scale <<= 8;
  scale |= result[7];
 //If there is no errors proceed
  if(ErrorCheck(result,9))
  {
    if (result[0]==255 || result[1]==255)
    {   // In this case pressure is 0 no bytes read;
        Serial1.println("Pressure in Pascals: 0Pa");
        console.log("pressure in Pascals:0Pa");
    }
    else
    {
        var pascals=pressure/scale;  //Value of differential pressure in Pascals;
       Serial1.println("Pressure in Pascals:"+pascals+"Pa");
       console.log("Pressure in Pascals:"+pascals+"Pa");
         //Serial1.println("Temperature in Celsius degree is:"+temp/200+"°C");
           // console.log("Temperature in Celsius degree is:"+temp/200+"°C");
        //formula
        var airFlow= Math.sqrt(pascals*2/C.DENSITY_OF_AIR)*0.015*0.015*Math.PI; //Ideal gas formula without conversions
        airFlow=airFlow*1000; // convert from m^3 to l 
        Serial1.println("ACCORDING TO THE SECOND RESULT AIR FLOW IS "+ airFlow);
       console.log("ACCORDING TO THE SECOND RESULT AIR FLOW IS "+ airFlow);
      }
  }
  else
  {
    Serial1.println("There is a connection error.");
        console.log("There is a connection error.");
    
  }
   
   
   }
}

//var firstTime=true;
setInterval(function(){
//if(firstTime){
if(digitalRead(BTN4) == 1){
  mainFunction();
  //firstTime=false;
}
});
//}else{
  //firstTime=true;
  //reset();
 // load();
  //E.reboot();
 // Start();
//}},1000);

   
