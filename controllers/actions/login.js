/*
    Copyright (C) 2015  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

module.exports = function LoginRecaptchaActionControllerModule(pb) {

    //dependencies
    var util = pb.util;
    var FormController = pb.FormController;
    var FormAuthentication = pb.FormAuthentication;
    var request = require("request");
    var pluginService = new pb.PluginService();

    /**
     * Authenticates a user
     * @class LoginActionController
     * @constructor
     * @extends FormController
     */
    function LoginRecaptchaActionController() {}
    util.inherits(LoginRecaptchaActionController, FormController);

    /**
     * 
     * @method onPostParamsRetrieved
     * @param {Object} post
     * @param {Function} cb
     */
    LoginRecaptchaActionController.prototype.onPostParamsRetrieved = function(post, cb) {
        var self = this;
        pluginService.getSettingsKV('google-recaptcha', function(err, settings) {
            var ip = self.req.headers['x-forwarded-for'];
            if ((settings.require_recaptcha_for_admin_login && post.adminAttempt) || (settings.require_recaptcha_for_user_login && !post.adminAttempt)) {
                self.verifyCaptcha(ip, settings.google_recaptcha_secret_key, post, cb);
            }
            else {
                self.authenticate(post, cb);
            }
        });
    };

    LoginRecaptchaActionController.prototype.verifyCaptcha = function(ip, secret, post, cb) {
        var self = this;
        request({
            method: 'POST',
            uri: 'https://www.google.com/recaptcha/api/siteverify',
            form: {
                secret: secret,
                response: post['g-recaptcha-response'],
                remoteip: ip
            }
        }, function(error, response, body) {
            body = JSON.parse(body);
            if (error || !body.success) {
                self.loginError(true, post.adminAttempt, cb);
                return;
            }
            self.authenticate(post, cb);
        });
    };

    LoginRecaptchaActionController.prototype.authenticate = function(post, cb) {
        var self = this;
        var adminAttempt = post.adminAttempt;
        var options = post;
        options.access_level = adminAttempt ? pb.SecurityService.ACCESS_WRITER : pb.SecurityService.ACCESS_USER;
        pb.security.authenticateSession(this.session, options, new FormAuthentication(), function(err, user) {
            if (util.isError(err) || user === null) {
                self.loginError(false, adminAttempt, cb);
                return;
            }

            //redirect
            var location = '/';
            if (self.session.on_login !== undefined) {
                location = self.session.on_login;
                delete self.session.on_login;
            }
            else if (adminAttempt) {
                location = '/admin';
            }
            self.redirect(location, cb);
        });
    };


    LoginRecaptchaActionController.prototype.loginError = function(recaptcha, adminAttempt, cb) {
        if (recaptcha) {
            this.session.error = this.ls.get('INVALID_LOGIN_RECAPTCHA');
        }
        else {
            this.session.error = this.ls.get('INVALID_LOGIN');
        }
        if (adminAttempt) {
            this.redirect('/admin/login', cb);
            return;
        }

        this.redirect('/user/login', cb);
    };

    LoginRecaptchaActionController.getRoutes = function(cb) {
        var routes = [{
            method: 'post',
            path: '/actions/login',
            auth_required: false,
            content_type: 'text/html'
        }];
        cb(null, routes);
    };

    //exports
    return LoginRecaptchaActionController;
};
