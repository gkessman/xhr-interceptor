(function() {
	var uuid = generateUUID();
	var ogxhr;
	self.actxhr = new XMLHttpRequest;
	var resBypass = false;

	function generateUUID() {
		var d = Date.now();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
	}

	this.act = {
		uuid: uuid,
		requestSeqNum: 1,
		queueURI: "mq_microservice_url"
	}

	XMLHttpRequest.prototype.reallySend = XMLHttpRequest.prototype.send;
	XMLHttpRequest.prototype.send = function(body) {
		var oldOnReadyStateChange;

		if (!self.actxhr.bypass) {
			ogxhr = this;
			overrideSend();
		}

		function onReadyStateChange() {
			if (this.readyState == 4 /* complete */ ) {
				/* This is where you can put code that you want to execute post-complete*/
				/* URL is kept in this._url */
				console.log("This is the response of the XHR!");
				console.log(this.getAllResponseHeaders().length);
				console.log(this.getAllResponseHeaders());
				if (!resBypass) {
					sendRes(this);
				}
			}

			if (oldOnReadyStateChange) {
				oldOnReadyStateChange();
			}
		}

		/* Set xhr.noIntercept to true to disable the interceptor for a particular call */
		if (!this.noIntercept) {
			if (this.addEventListener) {
				this.addEventListener("readystatechange", onReadyStateChange, false);
			} else {
				oldOnReadyStateChange = this.onreadystatechange;
				this.onreadystatechange = onReadyStateChange;
			}
		}
		console.log(body);
		this.reallySend(body);
		self.actxhr.bypass = false;
		resBypass = false;

	};

	function overrideSend() {

		if (typeof self.actxhr.bypass === 'undefined') {
			self.actxhr = new XMLHttpRequest();
			var actdata = {
				uuid: uuid,
				request: true,
				response: false,
				requestSeqNum: self.act.requestSeqNum,
				hopSeqNum: 0
			}

			self.actxhr.open("GET", self.act.queueURI, true);
			self.actxhr.bypass = true;
			self.actxhr.setRequestHeader("Access-Control-Allow-Origin", "*");
			self.actxhr.setRequestHeader("Content-Type", "application/json");
			self.actxhr.send(JSON.stringify(actdata));
			console.log("actxhr", actxhr);
		}

		ogxhr.setRequestHeader("uuid", uuid);
		ogxhr.setRequestHeader("requestSequenceNumber", self.act.requestSeqNum++);
		ogxhr.setRequestHeader("hopSequenceNumber", self.act.hopSeqNum);
	}

	function sendRes(res) {
		console.log("RES", res);
		resBypass = true;
	}

})();

// Test XHR Call

var url = "test_url";
var xhr = new XMLHttpRequest();
var data = "data";

xhr.onreadystatechange = function() {
	if (xhr.readyState == 4 && xhr.status == 200) {
		console.log(xhr.getAllResponseHeaders());
		console.log(xhr.responseText);
	}
}
xhr.open("GET", url, true);
xhr.send(data);