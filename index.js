const fastify = require('fastify')();
//const env = require('./.env.json');
const env = {"port":3000,  "cookies": "", "uid": 70000, "name": "undefined" , "check_in": false } ;
env.port = process.argv[2];
env.name = process.argv[3];
env.uid = process.argv[4];
env.cookies = process.argv[5];
env.check_in = process.argv[6];

const { notes, checkIn } = require('./hoyolab');

fastify.get('/', async (req, rep) => {
  return rep.send(await notes());
});

fastify.listen(env.port, '0.0.0.0', () => console.log(env.name+' ready!'));

if (env.check_in) {
  setInterval(() => {
    checkIn();
  }, 60_000 * (17*60 + 23)); // every 17 hours and 23 minutes (prime numbers, so it's slightly different every day)
}
