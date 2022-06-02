const crypto = require('crypto');
const { default: axios } = require('axios');
const env = require('./.env.json');


const paths = {
  GET_NOTES: 'https://bbs-api-os.hoyolab.com/game_record/genshin/api/dailyNote',
  GET_CHECKIN: 'https://sg-hk4e-api.hoyolab.com/event/sol/info',
  DO_CHECKIN: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign',
}

const CHECKIN_ACTID = 'e202102251931481';
const RESIN_INTERVAL = 8*60 // 8 minutes


function DS() {
  const time = Math.floor(Date.now() / 1000);
  const c = crypto
    .createHash('md5')
    .update(`salt=6s25p5ox5y14umn1p61aqyyvbvvl3lrt&t=${time}&r=Noelle`)
    .digest('hex');
  return `${time},Noelle,${c}`;
}

const headers = (root = 'sea') => {
  const _root = {
    sea: 'https://webstatic-sea.hoyolab.com',
    act: 'https://act.hoyolab.com',
  }[root];

  return {
    Origin: _root,
    Referer: _root,
    Accept: 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en-US;q=0.5',
    'x-rpc-app_version': '1.5.0',
    'x-rpc-client_type': '5',
    'x-rpc-language': 'en-us',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:100.0) Gecko/20100101 Firefox/100.0',
    Cookie: env.cookies,
    DS: DS(),
  };
};

const server = uid => ({
  6: 'os_usa',
  7: 'os_euro',
  8: 'os_asia',
  9: 'os_cht',
})[uid.toString()[0]];


async function notes() {
  const notes = await axios.get(paths.GET_NOTES, {
    headers: headers(),
    params: {
      role_id: env.uid,
      server: server(env.uid),
    },
  }).then(res => res.data.data);

  nextResin = parseInt(notes.resin_recovery_time) % RESIN_INTERVAL;

  return {
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
  }
}


async function checkIn() {
  const data = await axios.get(paths.GET_CHECKIN, {
    headers: headers('act'),
    params: {
      lang: 'en-us',
      act_id: CHECKIN_ACTID,
    },
    withCredentials: true,
  }).then(res => res.data.data);

  console.log(data);

  if (data.is_sign) return;

  return await axios.post(paths.DO_CHECKIN, {
    headers: headers('act'),
    params: { lang: 'en-us' },
    data: { act_id: CHECKIN_ACTID },
    withCredentials: true,
  }).then(res => (console.log(res.data), res.data.data));
}

module.exports = { notes, checkIn }