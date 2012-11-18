var url = require('url');
var http = require('http');

var HTMLForcerChild = require('./HTMLForcerChild.js');
HTMLForcerChild.setRoot('/home/img.mmmpa.net/public_html')
HTMLForcerChild.setDefaultHTML('/home/img.mmmpa.net/public_html/default.html')

var port_ = 80;
var port_image_server_ = 8080;

var store_ = {};

http.createServer(serve).listen(port_);

function serve(request, response){
	var request_url = url.parse(request.url);
	var host = request.headers.host;
	var path = request_url.path;

	var real_path = store_[path];
	if(real_path){
		pass(request, response, real_path);
		delete store_[path];
	}else{
		new HTMLForcerChild(request, response, path, getFuncForStore(host));
	}

}

function getFuncForStore(host){
	return function(img_id, img_url){
		store_[img_id] = ['http://', host, '/', img_url].join('');		
	}
}

function pass(request, response,url){
	var options = {
		host : '0.0.0.0',
		port : port_image_server_,
		path : url
	};

	var proxy = http.request(options);
	
	proxy.on('response', function(proxyResponse) {
		proxyResponse.addListener('data', function(chunk) {
			response.write(chunk, 'binary');
		});
		
		proxyResponse.addListener('end', function() {
			response.end();
		});
		
		response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
	});
	
	proxy.on('error', function(e) {
  	  console.log(e);
	})

	request.addListener('data', function(chunk) {
		proxy.write(chunk, 'binary');
	})
	
	request.addListener('end', function() {
		proxy.end();
	})
}
