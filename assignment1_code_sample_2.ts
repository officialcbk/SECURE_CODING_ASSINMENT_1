declare const require: any;
declare const process: any;

const readline = require("readline");
const mysql = require("mysql");
const { spawn } = require("child_process");
const https = require("https");

const dbConfig = {
  host: process.env.DB_HOST || "mydatabase.com",
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "secret123",
  database: process.env.DB_NAME || "mydb",
};

function sanitizeInput(input: string): string {
  // Basic cleanup: trim, limit length, and remove risky characters
  return input.trim().slice(0, 100).replace(/[^\w\s.-]/g, "");
}

function getUserInput(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve: (val: string) => void) => {
    rl.question("Enter your name: ", (answer: string) => {
      rl.close();
      resolve(sanitizeInput(answer));
    });
  });
}

function sendEmail(to: string, subject: string, body: string) {
  const safeTo = sanitizeInput(to);
  const safeSubject = sanitizeInput(subject);
  const safeBody = sanitizeInput(body);

  const mail = spawn("mail", ["-s", safeSubject, safeTo]);

  // some environments may not have stdin available
  if (mail.stdin) {
    mail.stdin.write(safeBody);
    mail.stdin.end();
  }

  mail.on("error", (error: any) => {
    console.error(`Error sending email: ${error}`);
  });
}

function getData(): Promise<string> {
  return new Promise((resolve: (val: string) => void, reject: (err: any) => void) => {
    https
      .get("https://insecure-api.com/get-data", (res: any) => {
        let data = "";
        res.on("data", (chunk: any) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", (err: any) => reject(err));
  });
}

function saveToDb(data: string) {
  const connection = mysql.createConnection(dbConfig);

  const query = "INSERT INTO mytable (column1, column2) VALUES (?, ?)";
  const values = [data, "Another Value"];

  connection.connect();

  connection.query(query, values, (error: any) => {
    if (error) {
      console.error("Error executing query:", error);
    } else {
      console.log("Data saved");
    }
    connection.end();
  });
}

(async () => {
  const userInput = await getUserInput();
  const data = await getData();
  saveToDb(data);
  sendEmail("admin@example.com", "User Input", userInput);
})();
