module.exports = function GoogleCaptchaPluginModule(pb) {

    /**
     * SamplePlugin - A sample for exemplifying what the main module file should
     * look like.
     *
     * @author Brian Hyder <brian@pencilblue.org>
     * @copyright 2015 PencilBlue, LLC
     */
    function GoogleCaptchaPlugin() {}

    /**
     * Called when the application is being installed for the first time.
     *
     * @param cb A callback that must be called upon completion.  cb(Error, Boolean).
     * The result should be TRUE on success and FALSE on failure
     */
    GoogleCaptchaPlugin.onInstall = function(cb) {
        cb(null, true);
    };

    /**
     * Called when the application is uninstalling this plugin.  The plugin should
     * make every effort to clean up any plugin-specific DB items or any in function
     * overrides it makes.
     *
     * @param cb A callback that must be called upon completion.  cb(Error, Boolean).
     * The result should be TRUE on success and FALSE on failure
     */
    GoogleCaptchaPlugin.onUninstall = function(cb) {
        var path = require('path');
        var pluginService = new pb.PluginService();
        var routes = [{
            method: 'get',
            path: "/admin/login",
            access_level: 0,
            auth_required: false,
            controller: path.join(pb.config.docRoot, 'plugins', 'pencilblue', 'controllers', 'admin', 'login.js'),
            content_type: 'text/html'
        }, {
            method: 'post',
            path: "/actions/login",
            access_level: 0,
            auth_required: false,
            controller: path.join(pb.config.docRoot, 'plugins', 'pencilblue', 'controllers', 'actions', 'login.js'),
            content_type: 'text/html'
        }, {
            method: 'post',
            path: "/actions/forgot_password",
            access_level: 0,
            auth_required: false,
            controller: path.join(pb.config.docRoot, 'plugins', 'pencilblue', 'controllers', 'actions', 'forgot_password.js'),
            content_type: 'text/html'
        }, {
            method: 'get',
            handler: 'login',
            path: "/user/login",
            auth_required: false,
            controller: path.join(pb.config.docRoot, 'plugins', 'pencilblue', 'controllers', 'user', 'login.js'),
        }];
        pluginService.getSettingsKV('google-recaptcha', function(err, settings) {
            if (settings.require_recaptcha_for_admin_login) {
                pb.RequestHandler.registerRoute(routes[0], 'pencilblue');
            }
            if (settings.require_recaptcha_for_user_login) {
                pb.RequestHandler.registerRoute(routes[3], 'pencilblue');
            }
            pb.RequestHandler.registerRoute(routes[1], 'pencilblue');
            pb.RequestHandler.registerRoute(routes[2], 'pencilblue');
        });
        cb(null, true);
    };

    /**
     * Called when the application is starting up. The function is also called at
     * the end of a successful install. It is guaranteed that all core PB services
     * will be available including access to the core DB.
     *
     * @param cb A callback that must be called upon completion.  cb(Error, Boolean).
     * The result should be TRUE on success and FALSE on failure
     */
    GoogleCaptchaPlugin.onStartup = function(cb) {
        var pluginService = new pb.PluginService();
        pluginService.getSettingsKV('google-recaptcha', function(err, settings) {
            if (settings.require_recaptcha_for_admin_login) {
                pb.RequestHandler.unregisterRoute('/admin/login', 'pencilblue');
            }
            if (settings.require_recaptcha_for_user_login) {
                pb.RequestHandler.unregisterRoute('/user/login', 'pencilblue');
            }
            pb.RequestHandler.unregisterRoute('/actions/login', 'pencilblue');
            pb.RequestHandler.unregisterRoute('/actions/forgot_password', 'pencilblue');
        });

        cb(null, true);
    };

    /**
     * Called when the application is gracefully shutting down.  No guarantees are
     * provided for how much time will be provided the plugin to shut down.
     *
     * @param cb A callback that must be called upon completion.  cb(Error, Boolean).
     * The result should be TRUE on success and FALSE on failure
     */
    GoogleCaptchaPlugin.onShutdown = function(cb) {
        cb(null, true);
    };

    //exports
    return GoogleCaptchaPlugin;
};
