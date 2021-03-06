'use strict';
const common = require('../common');
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;

var linkTime;
var fileTime;

if (common.isWindows) {
  // On Windows, creating symlinks requires admin privileges.
  // We'll only try to run symlink test if we have enough privileges.
  exec('whoami /priv', function(err, o) {
    if (err || o.indexOf('SeCreateSymbolicLinkPrivilege') == -1) {
      common.skip('insufficient privileges');
      return;
    }
  });
}

common.refreshTmpDir();

// test creating and reading symbolic link
const linkData = path.join(common.fixturesDir, '/cycles/root.js');
const linkPath = path.join(common.tmpDir, 'symlink1.js');

fs.symlink(linkData, linkPath, function(err) {
  if (err) throw err;

  fs.lstat(linkPath, common.mustCall(function(err, stats) {
    if (err) throw err;
    linkTime = stats.mtime.getTime();
  }));

  fs.stat(linkPath, common.mustCall(function(err, stats) {
    if (err) throw err;
    fileTime = stats.mtime.getTime();
  }));

  fs.readlink(linkPath, common.mustCall(function(err, destination) {
    if (err) throw err;
    assert.equal(destination, linkData);
  }));
});


process.on('exit', function() {
  assert.notStrictEqual(linkTime, fileTime);
});
