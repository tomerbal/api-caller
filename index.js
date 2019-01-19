const requestretry = require("requestretry");

class ApiCaller {

    constructor(maxAttempts) {
        this.options = {
            maxAttempts: maxAttempts,
            retryStrategy: myRetryStrategy,
            gzip: true
        };
    }

    configureProxy(url){
        requestretry.defaults({proxy: url});
    }

    async callGet(url, headers) {
        const options = Object.assign({}, this.options);
        options.uri = url;
        options.headers = headers;
        options.method = "GET";
        options.json = true;
        return requestretry(options);
    }

    async callGetCustomMaxAttempts(url, headers, maxAttempts) {
        const options = Object.assign({}, this.options);
        options.uri = url;
        options.headers = headers;
        options.method = "GET";
        options.json = true;
        options.maxAttempts = maxAttempts;
        return requestretry(options);
    }

    async callPost(url, headers, body) {
        const options = Object.assign({}, this.options);
        options.uri = url;
        options.headers = headers;
        options.method = "POST";
        options.json = true;
        options.body = body;
        return requestretry(options);
    }

    async callPostForm(url, headers, body) {
        const options =  Object.assign({}, this.options);
        options.uri = url;
        options.headers = headers;
        options.method = "POST";
        options.form = body;
        return requestretry(options);
    }
}

function myRetryStrategy(err, response, body) {
    const status = err || response.body.error || response.statusCode !== 200;
    if (status) {
        let message = "Error on calling api \n";
        if (response && response.hasOwnProperty("request") && response.request.hasOwnProperty("headers") && response.request.headers.hasOwnProperty("authorization")){
            message = message + "Authorization: " +response.request.headers.authorization + ".\n";
        }
        if (response && response.req && response.req.res && response.req.res.request){
            message = message +"On endpoint: " + response.req.res.request.href + ". \n";
        }
        if (err) {
            message = message + " Err: " + err + ".\n";
        }
        if (response && response.body.error) {
            message = message + "Response body error: " + response.body.error + ".\n";
        }
        if (response && response.body.message) {
            message = message + "Response body message: " + response.body.message + ".\n";
        }
        if (response && response.statusCode !== 200) {
            message = message + "Response body: " + response.body + ".\n";
            message = message + "Response status message: " + response.statusMessage + ".\n";
        }
        console.warn(message);
        return true;
    }
    return status;
}

module.exports = ApiCaller;