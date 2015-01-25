"use strict";
var EPSILON = Number.EPSILON;

// Make a name
var make_uid = (function() {
    var cur = 0;
    return function() {
        return cur++;
    }
})();

var random_color = function() {
    return "#" + (Math.floor(Math.random()*0x1000)).toString(16);
}

var close_enough = function(a, b, eps) {
    if (eps === undefined) eps = EPSILON;
    return Math.abs(a - b) <= eps;
}


// Sieve A through B, 
// Produces an object O such that for each key in B, 
//   O[key] is A[key] if key is in a, else B[key]
var sieve = function(A, B) {
    var ret = {}
    Object.keys(B).forEach(function(k) {
        ret[k] = A[k] === undefined ? B[k] : A[k]
    });
    return ret;
}

var Class = (function(defaults, methods, constructor, properties) {
    var functor;
    if (methods[""] !== undefined) {
        functor = methods[""];
        delete methods[""];
    }
    Object.freeze(methods);
    return function(desc) {
        var props = sieve(desc, defaults);
        var ret; // becomes this
        var privates = {};
        var proto = Object.create(null);
        Object.keys(methods).forEach(function(k) {
            if (k == "") {
                return;
            }
            proto[k] = function() {
                arguments[arguments.length] = privates;
                return methods[k].apply(ret, arguments);
            }
        });
        Object.freeze(proto);
        var propsDesc = {};
        Object.keys(props).forEach(function(key) {
            if (properties and properties[key]) {
                propsDesc[key] = properties[key];
                if (propsDesc[key].value) throw "Can't specify value in properties. Use defaults.";
                propsDesc[key].value = props[key];
            } else {
                propsDesc[key] = {
                    "value": props[key],
                    "writable": true
                }
            }
        });
        if (functor) {
            ret = function() {
                arguments[arguments.length] = privates;
                return functor.apply(ret, arguments);
            }
            ret.__proto__ = proto;  // XXX probably not a great idea
            Object.defineProperties(ret, props);
        } else {
            ret = Object.create(proto, propsDesc);
        }
        if (constructor) {
            constructor.call(ret, privates);
        }
        Object.seal(ret);
        return ret;
    }
});
