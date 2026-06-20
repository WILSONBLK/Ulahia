const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "public");
const port = Number(process.env.PORT || 4177);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8"
};

http
  .createServer((req, res) => {
    const cleanUrl = decodeURIComponent(req.url.split("?")[0]);
    const requestPath = cleanUrl === "/" ? "/index.html" : cleanUrl;
    const filePath = path.resolve(path.join(root, requestPath));

    if (!filePath.startsWith(root + path.sep) && filePath !== root) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "text/plain; charset=utf-8" });
      res.end(content);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Ulahia Pilot running at http://127.0.0.1:${port}`);
  });
