var networker = require('../');

// i got a /48 from hurricane electric
var block = networker('2001:470:abcd::', 48);

// let's split that in half
var net49 = block.subnet(49);
console.log('subnets in a /49 coming from a /48:', net49.size());   // 2

// maybe we're designing a big company network and we want 
// to reserve some addresses for internal vs external use
var internal = net49.network(0);
var external = net49.network(1);
// var moar = net49.network(2);   // you can try this, but you will get a RangeError

// perhaps we'd like to split up our internal network into two smaller ones:
var internal = internal.subnet(50);

// and in turn split those out into /64s for assignment to employees and equipment respectively
var employees = internal.network(0).subnet(64);
var equipment = internal.network(1).subnet(64);
console.log('/64s for employee use             :', employees.size());     // 16384
console.log('a random employee address         :', employees.address());

// great, now let's reserve a couple for dedicated equipment
var printserver = equipment.network(0);
var refrigerator = equipment.network(1);
var jukebox = equipment.network(16383);
console.log('printserver                       :', printserver.address());    // here we are picking a random full address from the network
console.log('refrigerator                      :', refrigerator.toString());  // here we are just printing the network prefix
console.log('jukebox                           :', jukebox.toString());

// and we can pick at random from a safe range of remaining equipment addresses
console.log('random address                    :', equipment.address(3, 16382));
console.log('random address                    :', equipment.address(3, 16382));
console.log('random address                    :', equipment.address(3, 16382));
