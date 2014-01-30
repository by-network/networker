# networker
design your own ipv4/6 networks

## why
mostly educational - trying to teach myself about ip routing and most of the subnet calculators out there are pretty confusing

## how
see [CIDR](http://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)

## example
```javascript
var networker = require('networker');

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
console.log('random address                    :', equipment.address(2, 16382));
console.log('random address                    :', equipment.address(2, 16382));
console.log('random address                    :', equipment.address(2, 16382));
```

## api
* `networker(address, [prefixLength, [networkSize=entireNetwork]])` create a new network
* `n.subnet(networkSize)`                  split a network into subnets using `networkSize` bits
* `n.size()`                               show the number of subnets in a network
* `n.network([index])`                     select a random subnet or pick one at a specific index
* `n.address([lowerIndex, [higherIndex]])` select a random subnet in the given range
* `n.toString()`                           string representation of the network address

## test
none yet.. but the example above can be run by doing `node example`

## notes
* the example uses ipv6, but ipv4 works the same way

## license
WTFPL
