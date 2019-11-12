const https = require('https');

// Token scopes
const FXA_PROFILE_SCOPE = "profile";
const FXA_PROXY_SCOPE = "https://identity.mozilla.com/apps/secure-proxy";

// The client ID for this extension
const FXA_CLIENT_ID = "a8c528140153d1c6";

const proxy_url = "https://firefox.factor11.cloudflareclient.com:2486/";
const user_agent = "Mozilla/5.0 (Windows NT 10.0; rv:68.0) Gecko/20100101 Firefox/68.0";

const purl = new URL(proxy_url);

module.exports = {
    user_agent,
    proxy_url,
    auth: (refresh_token) => {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: "oauth.accounts.firefox.com",
                port: 443,
                path: "/v1/token",
                method: 'POST',
                headers: {
                    'User-Agent': user_agent,
                    'Content-Type': 'application/json'
                }
            }
            const token_req = https.request(options, function (res) {
                var body = [];
                res.on('data', function (data) {
                    body.push(data);
                });

                res.on('end', function () {
                    const result_json = JSON.parse(body.join(''));
                    resolve(result_json);
                });
            });
            token_req.write(JSON.stringify({
                "client_id": FXA_CLIENT_ID,
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "scope": FXA_PROXY_SCOPE,
                "ttl": 259200, // Max time is 3 days
                "ppid_seed": Math.floor(Math.random() * 1024),
                "resource": purl.href
            }));
            token_req.end();
        })
    },
    // For testing
    proxyRequest: (access_token, targetUrl) => {
        const url = new URL(targetUrl);
        options = {
            host: purl.hostname,
            port: purl.port,
            path: url.href,
            headers: {
                'Proxy-Authorization': "Bearer " + access_token,
                'User-Agent': user_agent
            }
        };
        return new Promise((resolve, reject) => {
            https.get(options, (res) => {
                if (res.headers["cf-warp-error"] === '1') {
                    reject("CF Proxy error:", res.headers);
                    return;
                }
                let body = [];
                res.on('data', (data) => {
                    body.push(data);
                });

                res.on('end', () => {
                    resolve(body.join(''));
                });
            });
        });
    }
};