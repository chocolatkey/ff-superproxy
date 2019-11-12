# FF-Superproxy

A proof-of-concept proxy to proxy the Firefox/Cloudflare proxy

Firefox private network is a new offering from Mozilla that gives you access to an HTTPS proxy provided by Cloudflare. To use this nice proxy, however, you have to install an extension that's only available for Firefox. What if you want to use this proxy outside of FF? Unfortunately, the proxy uses `Authorization: Bearer XXX` tokens, which are not supported by common proxy clients (ProxySwitch Omega, python requests, etc.), and error status indication is done through a special `cf-warp-error` header. Worry no more, that's where this POC comes in! Important to note, however, is that:

- The code included only proxies HTTP, haven't implemented HTTPS yet
- Who knows when it will stop working, the API requests made here have changed in the latest version of the extension
- Currently, the proxy is free, however Mozilla seems to intend to charge for it later on after the beta period

# Usage

1. Clone the repo
2. `yarn install`
3. Create `config.json` with a `refresh_token` key. You get this by inspecting the extension in FF (Account sign on currently not implemented)
4. `node index.js`
5. Access proxy at `localhost:5050`

# TODO

- HTTPS support!
- Better error handling