const { spawn, exec } = require("child_process");
const watch = require("node-watch");

var ls;

function startServer() {
  if (ls && ls.killed == false) {
    setTimeout(() => {
      startServer();
    }, 100);
    return;
  }
  ls = spawn("node", ["server"]);

  ls.stdout.on("data", data => {
    console.log("\x1b[32m", data.toString(), "\x1b[0m");
  });

  ls.stderr.on("data", data => {
    console.log("\x1b[31m", data.toString(), "\x1b[0m");
  });

  ls.on("close", code => {
    console.log(`process exited with code ${code}`);
  });
}
function stopServer() {
  if (ls) ls.kill(9);
}

watch("./project", { recursive: true }, (event, filename) => {
  if (filename) {
    if (
      /\/protected\//.test(filename) ||
      /static\/admin\/crm\/modules\/[a-z0-9_\-]{1,}\/model\//i.test(filename)
    ) {
      stopServer();
      startServer();
    }
    console.log(`${filename} file Changed`);
  }
});

watch("./core", { recursive: true }, (event, filename) => {
  if (filename) {
    stopServer();
    startServer();
    console.log(`${filename} file Changed`);
  }
});

startServer();
exec("cd project/static/admin;sencha app watch -dev", (err, stdout, stderr) => {
  if (stdout) console.log(`${stdout}`);
  if (stderr) console.log(`${stderr}`);
});
