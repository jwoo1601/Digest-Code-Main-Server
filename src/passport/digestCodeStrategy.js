import util from 'util'
import passport from 'passport-strategy';

export default function Strategy(options, verify) {
    if (typeof options === 'function') {
        verify = options;
        options = { };
    }

    if (!verify) {
        throw new TypeError('DigestCodeStrategy requires a verify callback');
    }
    if (!options.version) {
        throw new TypeError('DigestCodeStrategy requires version number in "<major>.<minor>" format in options');
    }

    passport.Strategy.call(this);
    this.name = 'digest-code';
    this._verify = verify;
    this._version = options.version;
    this._headerName = options.headerName || 'X-Digest-Code-Authentication';
    this._propertyName = options.propertyName || 'authentication_token';
    this._versionPropertyName = options.versionPropertyName || 'authentication_token_version';
    this._passReqToCallback = options.passReqToCallback;
}

util.inherits(Strategy, passport.Strategy);

Strategy.prototype.authenticate = function(req) {
    let token;

    if (req.headers && req.headers[this.headerName]) {
        const components = req.headers[this.headerName].split(' ');
        if (components.length == 2) {
            const [version, credentials] = components;
            const match = /^v(?<version>[0-9]+\.[0-9])+$/.match(version);
            if (match) {
                if (match.groups.version && this._version === match.groups.version) {
                    token = credentials;
                } else {
                    this.fail('Incompatible authentication token version');
                }
            } else {
                this.fail(400);
            }
        } else {
            return this.fail(400);
        }
    }

    if (req.body && req.body[this._propertyName]) {
        if (token) {
            return this.fail(400);
        } else if (!req.body[this._versionPropertyName] || req.body[this._versionPropertyName] !== this._version) {
            return this.fail('Incompatible authentication token version');
        }
        token = req.body[this._propertyName];
    }

    if (req.query && req.query[this._propertyName]) {
        if (token) {
            return this.fail(400);
        } else if (!req.query[this._versionPropertyName] || req.query[this._versionPropertyName] !== this._version) {
            return this.fail('Incompatible authentication token version');
        }
        token = req.query[this._propertyName];
    }

    if (!token) {
        this.fail('Authentication token not found');
    }

    const self = this;
    function verified(err, user, info) {
        if (err) { 
            return self.error(err);
        }
        if (!user) {
          if (typeof info == 'string') {
            info = { message: info }
          }
          info = info || {};
          return self.fail(`Invalid authentication token: ${info.message}`);
        }
        self.success(user, info);
    }
      
    if (this._passReqToCallback) {
      this._verify(req, token, verified);
    } else {
      this._verify(token, verified);
    }
}