# Resin server for Genshin Impact

A small server that returns some data on:
- resin
- commissions
- weekly bosses
- Realm (teapot) Currency

## Setup

You will need to create a file called `.env.json` in this folder, with the following data:
```json
{
  "cookies": "cookies go here",
  "PORT": 3000,
  "uid": 123456789,
  "check_in": false
}
```
If `check_in` is set to `true`, the server will automatically do your daily check-in, so you never need to worry about it again.

To get your cookies, go to [your battle chronicle][bc], open the developer console, and run `copy(document.cookie)`. You can now paste your cookies into `.env.json`.

## Example response
```json
{
  "again_after": 480,
  "resin": 69,
  "resin_max": 160,
  "bosses": 2,
  "bosses_max": 3,
  "commissions": 3,
  "commissions_max": 4,
  "commissions_rewarded": false,
  "coins": 420,
  "coins_max": 2400,
}
```
`again_after` is the time it takes until you gain another resin plus 5 seconds, or `480` when your resin is full.



[bc]: https://act.hoyolab.com/app/community-game-records-sea/index.html#/ys