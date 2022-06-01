const crypto = require('crypto');
const fastify = require('fastify')();
const { cookies, PORT, uid } = require('./.env.json');

function DS() {
  const time = Math.floor(Date.now() / 1000);
  const c = crypto
    .createHash('md5')
    .update(`salt=6s25p5ox5y14umn1p61aqyyvbvvl3lrt&t=${time}&r=Noelle`)
    .digest('hex');
  return `${time},Noelle,${c}`;
}

const headers = () => ({
  Origin: 'https://webstatic-sea.hoyolab.com',
  Referer: 'https://webstatic-sea.hoyolab.com/',
  Accept: 'application/json, text/plain, */*',
  'Accept-Encoding': 'gzip, deflate',
  'Accept-Language': 'en-US;q=0.5',
  'x-rpc-app_version': '1.5.0',
  'x-rpc-client_type': '5',
  'x-rpc-language': 'en-us',
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0',
  cookie: cookies,
  ds: DS(),
});

const server = uid => ({
  6: 'os_usa',
  7: 'os_euro',
  8: 'os_asia',
  9: 'os_cht',
})[uid[0]];

const RESIN_INTERVAL = 8*60 // 8 minutes

fastify.get('/resin', async (req, rep) => {
  const res = await fetch(`https://bbs-api-os.hoyolab.com/game_record/genshin/api/dailyNote?role_id=${uid}&server=${server(uid)}`, { headers: headers() }).then(res => res.json());
  const notes = res.data;

  nextResin = parseInt(notes.resin_recovery_time) % RESIN_INTERVAL;

  return rep.send({
    again_after: nextResin ? nextResin + 5 : RESIN_INTERVAL,
    
    resin: notes.current_resin,
    resin_max: notes.max_resin,
    
    bosses: notes.remain_resin_discount_num,
    bosses_max: notes.resin_discount_num_limit,
    
    commissions: notes.finished_task_num,
    commissions_max: notes.total_task_num,
    commissions_rewarded: notes.is_extra_task_reward_received,
    
    coins: notes.current_home_coin,
    coins_max: notes.max_home_coin,
  });
});

fastify.listen(PORT);