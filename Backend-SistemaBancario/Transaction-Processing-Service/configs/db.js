'use strict';

import mongoose from "mongoose";

let listenersRegistered = false;

export const dbConnection = async () => {
    try {
        if (!listenersRegistered) {
            mongoose.connection.on('error', (error) => {
                console.log(`MongoDB | no se pudo conectar a mongoDB: ${error.message}`);
            });

            mongoose.connection.on('connecting', () => {
                console.log('MongoDB | intentando conectar a mongoDB');
            });
            mongoose.connection.on('connected', () => {
                console.log('MongoDB | conectado a mongoDB');
            });

            mongoose.connection.on('open', () => {
                console.log('MongoDB | conectado a la base de datos SistemaBancarioIN6BM');
            });

            mongoose.connection.on('reconnected', () => {
                console.log('MongoDB | reconectando a mongoDB');
            });
            mongoose.connection.on('disconnected', () => {
                console.log('MongoDB | desconectando a mongoDB');
            });

            listenersRegistered = true;
        }

        const mongoUri = process.env.MONGO_URI || process.env.URI_MONGO;
        if (!mongoUri) {
            throw new Error('MongoDB | URI de conexion no definida. Por favor establece MONGO_URI en el archivo .env');
        }

        await mongoose.connect(mongoUri, {
            dbName: 'SistemaBancarioIN6BM',
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });

        return mongoose.connection;
    } catch (error) {
        console.log(`Error al conectar la db: ${error.message}`);
        throw error;
    }
}

const gracefullShutdown = async (signal) => {
    console.log(`MongoDB | Received ${signal}. Closing database connection...`);
    try {
        await mongoose.disconnect();
        console.log('MongoDB | Database connection closed succesfully');
        process.exit(0);
    } catch (error) {
        console.error('MongoDB | Error during graceful shutdown:', error.message);
        process.exit(1);
    }
}

process.on('SIGINT', () => gracefullShutdown('SIGINT'));
process.on('SIGTERM', () => gracefullShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefullShutdown('SIGUSR2'));
