import express from 'express'
import { google } from 'googleapis'

const router = express.Router()

// Store tokens in memory (in production, store in database per user)
let tokens = null

// OAuth2 client
const getOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/calendar/callback'
    )
}

// Check if Google Calendar is configured
router.get('/status', (req, res) => {
    const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    const isConnected = !!tokens

    res.json({
        configured: isConfigured,
        connected: isConnected,
        message: !isConfigured
            ? 'Google Calendar not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env'
            : isConnected
                ? 'Connected to Google Calendar'
                : 'Not connected - click Connect to authorize'
    })
})

// Initiate OAuth flow
router.get('/auth', (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(400).json({
            error: 'Google Calendar not configured',
            setup: 'Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file'
        })
    }

    const oauth2Client = getOAuth2Client()

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events'
        ],
        prompt: 'consent'
    })

    res.redirect(authUrl)
})

// OAuth callback
router.get('/callback', async (req, res) => {
    const { code, error } = req.query

    if (error) {
        return res.redirect('/?calendar_error=' + encodeURIComponent(error))
    }

    if (!code) {
        return res.redirect('/?calendar_error=no_code')
    }

    try {
        const oauth2Client = getOAuth2Client()
        const { tokens: newTokens } = await oauth2Client.getToken(code)
        tokens = newTokens
        oauth2Client.setCredentials(tokens)

        console.log('✅ Google Calendar connected successfully')
        res.redirect('/?calendar_connected=true')
    } catch (error) {
        console.error('OAuth callback error:', error)
        res.redirect('/?calendar_error=' + encodeURIComponent(error.message))
    }
})

// Disconnect Google Calendar
router.post('/disconnect', (req, res) => {
    tokens = null
    res.json({ success: true, message: 'Disconnected from Google Calendar' })
})

// Get calendar events
router.get('/events', async (req, res) => {
    if (!tokens) {
        return res.status(401).json({ error: 'Not connected to Google Calendar' })
    }

    try {
        const oauth2Client = getOAuth2Client()
        oauth2Client.setCredentials(tokens)

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

        const now = new Date()
        const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: now.toISOString(),
            timeMax: oneMonthLater.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 50
        })

        const events = response.data.items.map(event => ({
            id: event.id,
            title: event.summary,
            description: event.description || '',
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            allDay: !event.start.dateTime
        }))

        res.json(events)
    } catch (error) {
        console.error('Error fetching calendar events:', error)
        if (error.code === 401) {
            tokens = null
            return res.status(401).json({ error: 'Token expired, please reconnect' })
        }
        res.status(500).json({ error: 'Failed to fetch calendar events' })
    }
})

// Sync a task to Google Calendar
router.post('/sync-task', async (req, res) => {
    if (!tokens) {
        return res.status(401).json({ error: 'Not connected to Google Calendar' })
    }

    const { title, description, dueDate, timeSlot } = req.body

    if (!title || !dueDate) {
        return res.status(400).json({ error: 'Title and due date are required' })
    }

    try {
        const oauth2Client = getOAuth2Client()
        oauth2Client.setCredentials(tokens)

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

        // Create event
        let start, end
        if (timeSlot) {
            start = { dateTime: `${dueDate}T${timeSlot}:00`, timeZone: 'America/New_York' }
            // Default 1 hour duration
            const endTime = new Date(`${dueDate}T${timeSlot}:00`)
            endTime.setHours(endTime.getHours() + 1)
            end = { dateTime: endTime.toISOString(), timeZone: 'America/New_York' }
        } else {
            // All-day event
            start = { date: dueDate }
            end = { date: dueDate }
        }

        const event = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: `📚 ${title}`,
                description: description || 'Created from Academic Dashboard',
                start,
                end
            }
        })

        res.json({
            success: true,
            eventId: event.data.id,
            message: 'Task synced to Google Calendar'
        })
    } catch (error) {
        console.error('Error syncing to calendar:', error)
        res.status(500).json({ error: 'Failed to sync task to calendar' })
    }
})

export default router
