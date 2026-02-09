import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/academic-dashboard'

        const conn = await mongoose.connect(uri)

        console.log(`📦 MongoDB Connected: ${conn.connection.host}`)
        return conn
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`)
        // Don't exit - allow app to run without DB for development
        console.log('⚠️  Running without database - using in-memory storage')
        return null
    }
}

export default connectDB
