const fastify = require('fastify')();
const env = require('./.env.json');
const { notes, checkIn } = require('./hoyolab');

fastify.get('/', async (req, rep) => {
  return rep.send(await notes());
});

fastify.listen(env.PORT, '0.0.0.0', () => console.log('ready!'));

if (env.check_in) {
  setInterval(() => {
    checkIn();
  }, 60_000 * (17*60 + 23)); // every 17 hours and 23 minutes (prime numbers, so it's slightly different every day)
}