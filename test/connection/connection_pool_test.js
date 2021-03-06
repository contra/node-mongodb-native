var mongodb = process.env['TEST_NATIVE'] != null ? require('../../lib/mongodb').native() : require('../../lib/mongodb').pure();
if(process.env['TEST_COVERAGE']) var mongodb = process.env['TEST_NATIVE'] != null ? require('../../lib-cov/mongodb').native() : require('../../lib-cov/mongodb').pure();

var testCase = require('nodeunit').testCase,
  debug = require('util').debug,
  inspect = require('util').inspect,
  Buffer = require('buffer').Buffer,
  gleak = require('../../dev/tools/gleak'),
  fs = require('fs'),
  ConnectionPool = require('../../lib/mongodb/connection/connection_pool').ConnectionPool;

/**
 * Retrieve the server information for the current
 * instance of the db client
 * 
 * @ignore
 */
exports.setUp = function(callback) {
  callback();
}

/**
 * Retrieve the server information for the current
 * instance of the db client
 * 
 * @ignore
 */
exports.tearDown = function(callback) {
  callback();
}

exports['Should Correctly create a pool instance with the expected values'] = function(test) {
  var connectionPool = new ConnectionPool('localhost', 2000, 1, null, {timeout:100, noDelay:true});
  test.equal(100, connectionPool.socketOptions.timeout);
  test.equal(true, connectionPool.socketOptions.noDelay);
  test.equal(null, connectionPool.socketOptions.encoding);
  test.equal(0, connectionPool.socketOptions.bufferSize);    
  test.done();
}

exports['Should correctly fail due to no server'] = function(test) {
  var connectionPool = new ConnectionPool('localhost', 2000, 4, null, {timeout:100, noDelay:true});

  // // Add event handler that will fire once the pool is ready
  connectionPool.on("poolReady", function(err, result) {      
  })

  // Add event handler that will fire when it fails
  connectionPool.on("error", function(err, connection) {
    test.equal(0, connectionPool.openConnections.length)
    test.done();
  });
  
  // Start the pool
  connectionPool.start();    
}

exports['Should Correctly create a pool of connections and receive an ok when all connections are active'] = function(test) {
  var connectionPool = new ConnectionPool('localhost', 27017, 4, {timeout:100, noDelay:true});

  // Add event handler that will fire once the pool is ready
  connectionPool.on("poolReady", function() {
    connectionPool.stop();
    test.done();
  })
  
  // Start the pool
  connectionPool.start();    
}

exports['Should Correctly connect and then force a restart creating new connections'] = function(test) {
  var connectionPool = new ConnectionPool('localhost', 27017, 4, {timeout:100, noDelay:true});
  var done = false;

  // Add event handler that will fire once the pool is ready
  connectionPool.on("poolReady", function() {      
    // Restart      
    if(done) {
      connectionPool.stop();
      test.done();        
    } else {
      // Trigger stop
      connectionPool.restart();
      done = true;
    }
  })
  
  // Start the pool
  connectionPool.start();        
},

/**
 * Retrieve the server information for the current
 * instance of the db client
 * 
 * @ignore
 */
exports.noGlobalsLeaked = function(test) {
  var leaks = gleak.detectNew();
  test.equal(0, leaks.length, "global var leak detected: " + leaks.join(', '));
  test.done();
}