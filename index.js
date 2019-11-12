const http = require('http');
const httpProxy = require('http-proxy');
const ff = require('./ff.js');
const conf = require('./config.json');

let currentToken = null;
let expiry = Date.now() / 1000;

const proxy = httpProxy.createProxyServer({});
const options = {
    target: ff.proxy_url,
    changeOrigin: true
};

proxy.on('proxyReq', (proxyReq, req, res, options) => {
    proxyReq.setHeader('Proxy-Authorization', "Bearer " + currentToken);
    proxyReq.path = req.url;
    // console.log("pr", proxyReq.getHeaders());
});

proxy.on('proxyRes', (proxyRes, req, res) => {
    if (proxyRes.headers["cf-warp-error"] === '1') {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });
        return res.end("CF Proxy error: " + JSON.stringify(req.headers) + "\n\n" + JSON.stringify(proxyRes.headers));
    }
});

proxy.on('error', err => {
    console.error(err);
});

http.createServer(function (req, res) {
    if ((expiry - Date.now() / 1000) <= 300) { // less than 5min until token expires
        console.log("Renewing access_token");
        ff.auth(conf.refresh_token).then(auth => {
            currentToken = auth.access_token; // JWT is AFAIK valid for 72hrs
            expiry = (Date.now() / 1000) + auth.expires_in;
            // console.log("Auth acquired");
            proxy.web(req, res, options);
        });
    } else {
        proxy.web(req, res, options);
    }
}).listen(5050);

/*
ff.proxyRequest('http://1.1.1.1/cdn-cgi/trace').then(res => console.log(res));
ff.proxyRequest('http://test.factor11.cloudflareclient.com/').then(res => console.log(res));
ff.proxyRequest('https://api.ipify.org/').then(res => console.log(res));
*/