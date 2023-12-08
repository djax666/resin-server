
const crypto = require('crypto');
const { default: axios } = require('axios');
//const env = require('./.env.json');
const env = {"port":3000,  "cookies": "", "uid": 70000, "name": "undefined" , "check_in": false } ;
env.port = process.argv[2];
env.name = process.argv[3];
env.uid = process.argv[4];
env.cookies = process.argv[5];
env.check_in = process.argv[6];


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


function secondesToHuman( i)
{
        let j = parseInt(i);
        //const d = Math.floor( j / 60 * 60 * 24);
        //j =  j % (d * 3600*24);
        const h = Math.floor(j / 3600);
        j = j - (h * 3600);
        const m = Math.floor(j /60);
        j = j - (m * 60 );
        const s = j;

        return ""+ h + " h " + m + " min " + s + " sec";

}

function minUntilExpeditionsDone( arg0, arg1, arg2,arg3,arg4) {
    let i ;
        i = parseInt(arg0);
    if ( parseInt(arg1) < i) { i = parseInt( arg1); }
    if ( parseInt(arg2) < i) { i = parseInt( arg2); }
    if ( parseInt(arg3) < i) { i = parseInt( arg3); }
    if ( parseInt(arg4) < i) { i = parseInt( arg4); }
    return i;
}
function getISOLocalString() {
  let date = new Date();
  let tzo = -date.getTimezoneOffset();

  if (tzo === 0) {

    return date.toISOString();

  } else {

    let dif = tzo >= 0 ? '+' : '-';
    let pad = function(num, digits=2) {
      return String(num).padStart(digits, "0");
    };

    return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      ' ' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds());
//        +
//      dif + pad(tzo / 60) +
//      ':' + pad(tzo % 60) +
//      '.' + pad(date.getMilliseconds(), 3);

  }
}

async function notes() {
  const notes = await axios.get(paths.GET_NOTES, {
    headers: headers(),
    params: {
      role_id: env.uid,
      server: server(env.uid),
    },
  }).then(res => res.data.data);

  nextResin = parseInt(notes.resin_recovery_time) % RESIN_INTERVAL;

//      uedmin = minUntilExpeditionsDone(
//          notes.expeditions[0].remained_time,
//          notes.expeditions[1].remained_time,
//          notes.expeditions[2].remained_time,
//          notes.expeditions[3].remained_time,
//          notes.expeditions[4].remained_time);
        let uedmin  = 99999999999999999999;
        for (let j = 0; j < notes.current_expedition_num; j++)
        {
                if (parseInt(notes.expeditions[j].remained_time) < uedmin){
                        uedmin = parseInt(notes.expeditions[j].remained_time);
                }
        }
//////////////////////////////////////////
        uedminh = secondesToHuman(uedmin);

        diffcoins = notes.max_home_coin -  notes.current_home_coin;
        coin_refill_hours = Math.floor(diffcoins / 30);
//      timestamp = new Date().toISOString().slice(0, 10);
        timestamp = getISOLocalString();
        //////////////////////////////////
        ptrt= "";
        if (notes.transformer.recovery_time.Day > 0){
                ptrt = ptrt + notes.transformer.recovery_time.Day + ( notes.transformer.recovery_time.Day == 1 ? " jour" : " jours");
        }else{
                ptrt = ptrt + notes.transformer.recovery_time.Hour +"h" + notes.transformer.recovery_time.Minute + "m" + notes.transformer.recovery_time.Second+"s";
        }
        //////////////////////////////////
        let aef = false;
        for (let i = 0; i < notes.current_expedition_num; i++){
                if (notes.expeditions[i].status == "Finished")
                {
                        aef = true;
                }
        }
        are_expeditions_finished = aef;
        ////////////////////////////////
  return {
          timestamp: timestamp,
          uid: env.uid,
          name: env.name,
    again_after: notes.current_resin < notes.max_resin ? nextResin + 5 : RESIN_INTERVAL,

    resin: notes.current_resin,
    resin_max: notes.max_resin,
    resin_recovery_time: parseInt(notes.resin_recovery_time),
    resin_recovery_time_h: secondesToHuman(notes.resin_recovery_time),

    bosses: notes.remain_resin_discount_num,
    bosses_max: notes.resin_discount_num_limit,

    commissions: notes.finished_task_num,
    commissions_max: notes.total_task_num,
    commissions_rewarded: notes.is_extra_task_reward_received,
    are_expeditions_finished: are_expeditions_finished,
    coins: notes.current_home_coin,
    coins_max: notes.max_home_coin,
    coins_refill_hours: coin_refill_hours,
    parametric_transformer_reached: notes.transformer.recovery_time.reached ,
    parametric_transformer_recovery_time: ptrt,

    until_expeditions_done: uedmin,
    until_expeditions_done_h: uedminh,
    full_notes: notes,
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
