const mongoose = require('mongoose');

const MONGOOSE_OPTS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
};

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ Falta la variable MONGO_URI en el .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, MONGOOSE_OPTS);

    console.log('✅ MongoDB conectado');
    console.log(`   → DB: ${process.env.MONGO_DB || 'No especificada en .env'}`);
  } catch (err) {
    console.error('❌ Error conectando a MongoDB:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB desconectado');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconectado');
  });
}

const dns = require('dns');

dns.resolveSrv('_mongodb._tcp.cluster0.01itri5.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('❌ SRV falla:', err);
  } else {
    console.log('✅ SRV ok:', addresses);
  }
});

module.exports = { connectDB };