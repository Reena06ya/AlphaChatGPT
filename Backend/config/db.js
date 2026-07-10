const { initDb } = require('./jsonDb');

const connectDB = async () => {
  try {
    initDb();
  } catch (error) {
    console.error(`Database Init Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
