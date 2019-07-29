const waitForGlobal = function(name, cb) {
  if (window[name]) {
    return cb(window[name]);
  } else {
    return window.setTimeout(() => test(name, cb), 100);
  }
};

export { waitForGlobal };
