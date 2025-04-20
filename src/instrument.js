const Sentry = require("@sentry/node");

if (process.env.NODE_ENV === "production") {
    Sentry.init({
        dsn: "https://19eac56dedac705cdb9b4a1a95c0d4f8@o4509186086273024.ingest.de.sentry.io/4509186803695696",
    });
}