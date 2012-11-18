var fs = require('fs');

var RandomID = require('./RandomID.js');

var root_ = '/';
var false_text = 'not found';
var default_html_ = '';

var HTMLForcerChild = function(request, response, path, callback){
	this.response = response;
	this.request = request;
	this.path = path;
	this.host = request.headers.host;
	this.callback = callback;

	var html_name = path.replace(/(\.[^\.]*)$/,'.html');
	var html_path = [root_, html_name].join('');

	var self = this;
	fs.readFile(html_path, this.getFuncOnRead());
}

module.exports = HTMLForcerChild;
module.exports.setRoot = setRoot;
module.exports.setDefaultHTML = setDefaultHTML;

HTMLForcerChild.prototype.responsePage = responsePage;
HTMLForcerChild.prototype.responsePageFalse = responsePageFalse;
HTMLForcerChild.prototype.getOneTimePath = getOneTimePath;
HTMLForcerChild.prototype.getFuncOnRead = getFuncOnRead;

function getFuncOnRead(again){
	var self = this;

	return function(err, data){
		if(err){
			if(!again){
				fs.readFile(default_html_, self.getFuncOnRead(true));
			}else{
				self.responsePageFalse();				
			}
			return;
		}
		self.responsePage(data.toString());
	}
}

function setRoot(root){
	root_ = root.replace(/\/$/,'');
}

function setDefaultHTML(html_path){
	default_html_ = html_path;
}

function responsePage(html){
	var response = this.response;

	var img_id = '/' + this.getOneTimePath();
	this.callback(img_id, this.path);

	var img_href = ['http://', this.host, img_id].join('')
	var html = html.replace(/<% url %>/g, img_href)
	
	response.writeHead(200, {
		'Content-Type': 'text/html' 
	});
	response.write(html);
	response.end();	

}

function getOneTimePath(){
	var seed = this.request.headers['user-agent'] || '';
	return RandomID.getID(seed).replace(/\s/g,'');
}

function responsePageFalse(){
	var response = this.response;
	var html = false_text;

	response.writeHead(404, {
		'Content-Type': 'text/html' 
	});
	response.write(html);
	response.end();	
}

