module.exports = function LoginPageModule(pb) {
    var util = pb.util;

    function LoginPage() {}
    util.inherits(LoginPage, pb.BaseController);

    LoginPage.prototype.login = function(adminAttempt, cb) {
        var self = this;
        var pluginService = new pb.PluginService();
        pluginService.getSettingsKV('google-recaptcha', function(err, settings) {
            if (util.isError(err)) {
                return cb(err, '');
            }
            self.ts.setTheme('google-recaptcha');
            self.ts.registerLocal('admin_attempt', adminAttempt);
            self.ts.registerLocal('login_js_file', pb.PluginService.genPublicPath('google-recaptcha', 'js/login.js'));
            self.ts.registerLocal('google_recaptcha_site_key', settings.google_recaptcha_site_key);
            self.ts.load('login', function(err, result) {
                cb({
                    content: result
                });
            });
        });
    };
    
    LoginPage.prototype.adminLogin = function(cb){
        this.login(true, cb);
    };
    
    LoginPage.prototype.userLogin = function(cb){
        this.login(false, cb);
    };
    

    LoginPage.getRoutes = function(cb) {
        var routes = [{
            method: 'get',
            path: '/admin/login',
            auth_required: false,
            content_type: 'text/html',
            handler: 'adminLogin'
        },{
            method: 'get',
            path: '/user/login',
            auth_required: false,
            handler: 'loginUser',
            content_type: 'text/html',
            handler: 'userLogin'
        }];
        cb(null, routes);
    };

    return LoginPage;
};