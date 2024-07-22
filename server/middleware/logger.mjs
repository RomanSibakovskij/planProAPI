import winston from "winston";
import expressWinston from "express-winston";
import { MongoDB } from "winston-mongodb";
import dotenv from 'dotenv';

dotenv.config();

// myLevels yra objektas, kuriame yra nurodytos logavimo lygių reikšmės.
const myLevels = {
  error: 0,
  warn: 1,
  success: 2,
  info: 3,
  http: 4,
  verbose: 5,
  debug: 6,
  silly: 7,
};

// Sukuriame logger'į, kuris naudos myLevels lygius.
const logger = winston.createLogger({
  levels: myLevels,
});

// Sukuriame transportą, kuris įrašys logus į MongoDB.
// Trasnport yra objektas, kuris nurodo, kur ir kaip bus saugomi logai.
const mongoTransport = new MongoDB({
  db: process.env.MONGO_DB_URI,
  collection: "logs",
  // level nurodo, kuriuos logavimo lygius siųsti į MongoDB.
  // silly nurodžiaus, kad visi lygiai bus siunčiami.
  level: "info",
  options: { useUnifiedTopology: true },
  // metaKey nurodo, kaip bus pavadintas objektas, kuriame bus saugomi papildomi logavimo duomenys.
  metaKey: "meta",
});

// Pridedame transportą prie logger'io.
logger.add(mongoTransport);

// Funkcija, kuri konvertuoja logavimo lygį į žmogaus suprantamą formatą.
const levelToReadable = (level) => {
  switch (level) {
    case "info":
      return "Information";
    case "warn":
      return "Warning";
    case "error":
      return "Error";
    case "success":
      return "Success";
    default:
      return level;
  }
};

// Funkcija, kuri formatuoja logą.
const formatMessage = (info) => {
  if (info.meta && info.meta.req) {
    return `HTTP Method: ${info.meta.req.method}, URL: ${info.meta.req.url}`;
  } else {
    return info.message;
  }
};

// Sukuriame middleware, kuris įrašo visus užklausų logus į failą.
export const expressLogger = expressWinston.logger({
  levels: myLevels,
  // Transports yra masyvas, kuriame nurodomi visi transportai, į kuriuos bus siunčiami logai.
  transports: [
    // Console transportas siunčia logus į konsolę.
    new winston.transports.Console(),
    mongoTransport,
  ],
  // Format yra funkcija, kuri nurodo, kaip bus formatuojamas logas.
  format: winston.format.combine(
    winston.format.json(),
    // Funkcija, kuri nurodo, kaip bus formatuojamas logas.
    winston.format.printf((info) => {
      // logEntry yra objektas, kuriame yra visi logavimo duomenys.
      const logEntry = { ...info, ...info.meta };

      logEntry.level = levelToReadable(logEntry.level);
      logEntry.message = formatMessage(logEntry);
      return JSON.stringify(logEntry);
    })
  ),
  // Meta yra funkcija, kuri nurodo, kokie duomenys bus įtraukti į logą.
  dynamicMeta: function (req, res, err) {
    // Jei logas yra sukuriamas dėl klaidos, tai įtraukiame klaidos pranešimą.
    const meta = {
      // req yra objektas, kuriame yra visi užklausos duomenys. arba null jei užklausa nebuvo.
      req: {
        url: req ? req.url : null,
        headers: req ? req.headers : null,
        method: req ? req.method : null,
        httpVersion: req ? req.httpVersion : null,
        originalUrl: req ? req.originalUrl : null,
        query: req ? req.query : null,
      },
      // res yra objektas, kuriame yra visi atsakymo duomenys. arba null jei atsakymas nebuvo.
      res: {
        statusCode: res ? res.statusCode : null,
        statusMessage: res ? res.statusMessage : null,
      },
    };
    // console.log('Meta:', meta);
    return meta;
  },
  // Ignoruoja tam tikras užklausas.
  level: function (req, res) {
    let level = "";
    if (res.statusCode >= 100) {
      level = "info";
    }
    if (res.statusCode === 200) {
      level = "success";
    }
    if (res.statusCode === 300) {
      level = "redirect";
    }
    if (res.statusCode >= 400) {
      level = "warn";
    }
    if (res.statusCode >= 500) {
      level = "error";
    }
    return level;
  },
  meta: true,
  expressFormat: true,
  colorize: false,
  // Ignoruoja tam tikras užklausas. Jei funkcija grąžina true, užklausa bus ignoruojama.
  ignoreRoute: function (req, res) {
    return false;
  },
});
