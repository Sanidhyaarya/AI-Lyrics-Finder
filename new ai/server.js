const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Function to clean song title
function cleanSongTitle(title) {
    return title
        .replace(/\([^)]*\)/g, '') // Remove anything in parentheses
        .replace(/\[[^\]]*\]/g, '') // Remove anything in square brackets
        .replace(/[^\w\s]/g, '') // Remove special characters
        .trim();
}

// API endpoint to fetch lyrics
app.post('/api/lyrics', async (req, res) => {
    try {
        const { song } = req.body;
        const cleanedSong = cleanSongTitle(song);
        
        // First, search for the song to get artist and title
        const searchResponse = await axios.get(`https://api.lyrics.ovh/suggest/${encodeURIComponent(cleanedSong)}`);
        
        if (searchResponse.data.data && searchResponse.data.data.length > 0) {
            const firstResult = searchResponse.data.data[0];
            const artist = encodeURIComponent(firstResult.artist.name);
            const title = encodeURIComponent(cleanSongTitle(firstResult.title));
            
            // Now fetch the lyrics using the correct format
            const lyricsResponse = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${title}`);
            
            if (lyricsResponse.data.lyrics) {
                res.json({ 
                    lyrics: lyricsResponse.data.lyrics,
                    artist: firstResult.artist.name,
                    title: firstResult.title
                });
            } else {
                // Try alternative search if first attempt fails
                const alternativeResponse = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${encodeURIComponent(firstResult.title)}`);
                
                if (alternativeResponse.data.lyrics) {
                    res.json({ 
                        lyrics: alternativeResponse.data.lyrics,
                        artist: firstResult.artist.name,
                        title: firstResult.title
                    });
                } else {
                    res.json({ 
                        error: 'Lyrics not found',
                        message: 'Sorry, I couldn\'t find the lyrics for this song. Please try another one.'
                    });
                }
            }
        } else {
            res.json({ 
                error: 'Song not found',
                message: 'Sorry, I couldn\'t find that song. Please try another one.'
            });
        }
    } catch (error) {
        console.error('Error fetching lyrics:', error);
        res.status(500).json({ 
            error: 'Failed to fetch lyrics',
            message: 'There was an error processing your request. Please try again.'
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
