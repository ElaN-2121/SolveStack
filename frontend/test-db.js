const fs = require("fs");
const { Client } = require("pg");

const env = fs.readFileSync(".env", "utf8");
const url = env.match(/DIRECT_URL="(.*)"/)[1];

const client = new Client({ connectionString: url, connectionTimeoutMillis: 20000 });

client
  .connect()
  .then(() => client.query("select 1 as ok"))
  .then((r) => { console.log("OK", r.rows); return client.end(); })
  .catch((e) => console.error("FAIL", e.code, e.message));