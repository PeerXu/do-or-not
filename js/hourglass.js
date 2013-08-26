var _now = function() { return new Date(); };

var hg_new = function(left, interval, callbacks) {
    var msl = left * 1000;
    var _interval = "number" == typeof(interval) ? interval : 10;
    if("object" != typeof(callbacks)) {
        callbacks = {};
    }
    var _callbacks = {};
    var events = ["start", "run", "stop", "pause", "resume"];
    for(var idx in events) {
        var evt = events[idx];
        _callbacks[evt] = evt in callbacks && "function" == typeof(callbacks[evt]) ? callbacks[evt] : function() {};
    }

    var _hg = {
        _begin: undefined,
        _total: msl,
        _left: msl,
        _acc: 0,
        _status: "ready",
        _interval: interval,
        _callbacks: _callbacks,
        _fd: undefined
    };
    return _hg;
};

var _run = function(hg) {
    if(hg._left <= 0) {
        hg_stop(hg);
        return;
    }
    hg._callbacks.run();
    hg._left = hg._total - (_now() - hg._begin) - hg._acc;
};

var _start = function(hg) {
    hg._status = "running";
    hg._begin = _now();
    hg._fd = setInterval("_run(hg)", hg._interval);
};

var hg_start = function(hg) {
    _start(hg);
    hg._callbacks.start();
    return hg;
};

var hg_stop = function(hg) {
    clearInterval(hg._fd);
    hg._status = "stop";
    hg._callbacks.stop();
    hg._fd = undefined;
};

var hg_pause = function(hg) {
    clearInterval(hg._fd);
    hg._fd = undefined;
    hg._status = "paused";
    hg._acc += _now() - hg._begin;
    hg._begin = undefined;
    hg._callbacks.pause();
    hg._left = self._total - self._acc;
};

var hg_resume = function(hg) {
    if("paused" == hg._status) {
        _start(hg);
        hg._callbacks.resume();
    }
    return hg;
};
