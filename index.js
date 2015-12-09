const { Cc, Ci, Cr, Cu, Cm, components } = require("chrome");

Cm.QueryInterface(Ci.nsIComponentRegistrar);
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

// globals
var factory;
const aboutPage_description = 'This is my custom about page';
const aboutPage_id = '6c098a80-9e13-11e5-a837-0800200c9a66'; // make sure you generate a unique id from https://www.famkruithof.net/uuid/uuidgen
const aboutPage_word = 'foobar';
const aboutPage_page = Services.io.newChannel('data:text/html,hi this is the page that is shown when navigate to about:foobar', null, null);

function AboutCustom() {};

AboutCustom.prototype = Object.freeze({
    classDescription: aboutPage_description,
    contractID: '@mozilla.org/network/protocol/about;1?what=' + aboutPage_word,
    classID: components.ID('{' + aboutPage_id + '}'),
    QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),

    getURIFlags: function(aURI) {
        return Ci.nsIAboutModule.ALLOW_SCRIPT;
    },

    newChannel: function(aURI) {
        let channel = aboutPage_page;
        channel.originalURI = aURI;
        return channel;
    }
});

function Factory(component) {
    this.createInstance = function(outer, iid) {
        if (outer) {
            throw Cr.NS_ERROR_NO_AGGREGATION;
        }
        return new component();
    };
    this.register = function() {
        Cm.registerFactory(component.prototype.classID, component.prototype.classDescription, component.prototype.contractID, this);
    };
    this.unregister = function() {
        Cm.unregisterFactory(component.prototype.classID, this);
    }
    Object.freeze(this);
    this.register();
}

exports.main = function() {
  factory = new Factory(AboutCustom);
};

exports.onUnload = function(reason) {
  factory.unregister();
};
