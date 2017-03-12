/*
Proof of concept OTA js
(c) 2017 Wilberforce

Uses esp8266 wiflash - this will need to be extended.. bin filename different
scripts/wiflash.sh -v 192.168.15.18:88 espruino_esp32.bin espruino_esp32.bin
*/

var ota=0x300000;
var f=require("Flash");

//var next=ESP32.setNextBootPartition();
//ota address would come from next.addr;
/*
Flash.erasePage(addr)
Flash.getFree()
Flash.getPage(addr)
Flash.read(length, addr)
Flash.write(data, addr)

http://esp-idf.readthedocs.io/en/latest/api/system/ota.html?highlight=ota

*/


function flash_next(req,res) {
  var bin='user1.bin';
  console.log(bin);
  res.writeHead(200);
  res.end(bin);
  return 200;
}

//http://www.espruino.com/Reference/#t_l_httpCRs_pipe
// options - An optional object { chunkSize : int=32, end : bool=true, complete : function }


function Piper(res,total) {
    console.log( 'expecting: ', total );
    this.res=res;
    this.total=total;
    this.bytes=0;
}

Piper.prototype.write = function(data) {
    var l=data.length;
    this.bytes=this.bytes+l;
    //console.log({d:data.length,b:this.bytes,t:this.total});
    f.write(data, ota);
    ota=ota+l;
    if ( this.bytes == this.total) {
      console.log('Done!');
      this.res.writeHead(200);
      this.res.end('');      
    }
};

Piper.prototype.end = function(data) {
    console.log( 'end');
};


function flash_upload(req,res) {
  
  function done() {
    console.log('<< in done');
    res.writeHead(200);
    res.end('');
    console.log('<< flash_upload');
  }
  

  p= new Piper(res,req.headers["Content-Length"]);
  
  console.log(req.headers["Content-Length"]);
  console.log(req.available());
  /// Never called...
  res.on("drain",function(req){
    console.log('Drained!');
  });
  req.pipe(p,{chunkSize: 4096});
  return 200;
}

function flash_reboot(req,res) {
  console.log('would reboot');
  // settime out the ESP32.reboot();
  res.writeHead(200);
  res.end('');
  return 200;
}


var http = require("http");
  http.createServer(function (req, res) {
    //console.log(req);
    console.log(req.method);
    console.log(req.url);
    //var d=new Date();
    //res.end("Hello World "+d); 
    code=404;
    if(req.url=='/flash/next' && req.method == 'GET') code=flash_next(req,res);
    if(req.url=='/flash/reboot' && req.method == 'POST') code=flash_reboot(req,res);
    if(req.url=='/flash/upload' && req.method == 'POST') code=flash_upload(req,res);
    if ( code == 404 ) {
      res.writeHead(404);
      res.end('Not Found');
    }
  }).listen(88); 
// Not found
    
