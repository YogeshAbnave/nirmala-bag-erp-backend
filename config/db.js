const mongoose = require('mongoose');

const dbUri = 'mongodb+srv://Nirmala-bag:Nirmala7596@ac-aphcdql.bi0xw4z.mongodb.net/Nirmala-bag?retryWrites=true&w=majority';
// const dbUri = 'mongodb://localhost:27017/NirmalaBagErp';
// Suppress the punycode deprecation warning
process.removeAllListeners('warning');

// Updated connection options
const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        
        await mongoose.connect(dbUri, {
            useNewUrlParser: true,      
            useUnifiedTopology: true,   
        });

        // Handle the ensureIndex deprecation
        // Apply this to all schemas that need indexes
        mongoose.set('autoIndex', true);
        
        console.log('MongoDB connected successfully');

        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Export the connection function
module.exports = connectDB;