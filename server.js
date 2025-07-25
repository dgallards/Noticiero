const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const xml2js = require('xml2js');

const app = express();
const PORT = 8080;

// Enable CORS
app.use(cors());

// Spain popular RSS feeds
const spainFeeds = [
    { name: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada" },
    { name: "El Mundo", url: "https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml" },
    { name: "La Vanguardia", url: "https://www.lavanguardia.com/rss/home.xml" },
    { name: "20 Minutos", url: "https://www.20minutos.es/rss/" },
    { name: "Canal Extremadura", url: "https://www.canalextremadura.es/rss/noticias" },

];

// International popular RSS feeds
const internationalFeeds = [
    { name: "BBC World", url: "http://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "CNN Top Stories", url: "http://rss.cnn.com/rss/edition.rss" },
    { name: "The Guardian World", url: "https://www.theguardian.com/world/rss" },
    { name: "Al Jazeera English", url: "https://www.aljazeera.com/xml/rss/all.xml" }
];

const extremaduraFeeds = [
{ name: "Hoy Última Hora", url: "https://www.hoy.es/rss/2.0/?section=ultima-hora" },
{ name: "Hoy Villanueva", url: "https://www.hoy.es/rss/2.0/?section=villanueva" },
{ name: "Hoy Cáceres", url: "https://www.hoy.es/rss/2.0/?section=caceres" },
{ name: "El Periódico Extremadura vegas Altas", url: "https://www.elperiodicoextremadura.com/rss/section/25006" },
{ name: "El Periódico Extremadura Cáceres", url: "https://www.elperiodicoextremadura.com/rss/section/25017" },
{ name: "Canal Extremadura Podcast", url: "https://www.canalextremadura.es/podcast/3342" }
]

const scienceFeeds = [
  { name: "New Scientist", url: "https://www.newscientist.com/feed/home/" },
  { name: "Scientific American", url: "https://rss.sciam.com/ScientificAmerican-Global" },
  { name: "Science News", url: "https://www.sciencenews.org/feed/" },
  { name: "LiveScience", url: "https://www.livescience.com/feeds/all" },
  { name: "Space.com", url: "https://www.space.com/feeds/all" }
];


const videogamesFeeds = [
  { name: "IGN Games", url: "https://feeds.ign.com/ign/games-all" },
  { name: "Kotaku", url: "https://kotaku.com/rss" },
  { name: "Polygon", url: "https://polygon.com/rss/index.xml" },
  { name: "Rock Paper Shotgun", url: "https://www.rockpapershotgun.com/feed/" },
  { name: "GameSpot", url: "https://www.gamespot.com/feeds/mashup/" }
];

const economyFeeds = [
  { name: "Financial Times", url: "https://www.ft.com/?format=rss" },
  { name: "Expansión", url: "https://e00-expansion.uecdn.es/rss/economia.xml" },
  { name: "The Spanish Economy", url: "https://www.thespanisheconomy.com/rss-subscription" },
  { name: "Banco de España", url: "https://www.bde.es/wbe/en/inicio/rss/" },
  { name: "ECB News", url: "https://www.ecb.europa.eu/rss/html/index.en.html" }
];

const cultureFeeds = [
  { name: "El País Cultura", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/cultura/portada" },
  { name: "The New Yorker Culture", url: "https://www.newyorker.com/feed/culture" },
  { name: "The Guardian Culture", url: "https://www.theguardian.com/culture/rss" },
  { name: "Le Monde Culture", url: "https://www.lemonde.fr/culture/rss_full.xml" },
  { name: "France 24 Culture", url: "https://www.france24.com/en/rss" }
];

const technologyFeeds = [
  { name: "TechCrunch", url: "http://feeds.feedburner.com/TechCrunch/" },
  { name: "Wired", url: "https://www.wired.com/feed/rss" },
  { name: "Genbeta", url: "https://www.genbeta.com/tag/feeds/rss2.xml" },
  { name: "MuyComputer", url: "https://www.muycomputer.com/feed/" },
  { name: "Hipertextual Tecnología", url: "https://hipertextual.com/feed/tecnologia" }
];

// Add to feeds endpoint
app.get('/feeds', (req, res) => {
    res.json({
        spain: spainFeeds,
        extremadura: extremaduraFeeds,
        international: internationalFeeds,
        science: scienceFeeds,
        videogames: videogamesFeeds,
        economy: economyFeeds,
        culture: cultureFeeds,
        technology: technologyFeeds
    });
});

// Serve index.html from resources folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'resources', 'index.html'));
});


// Endpoint to fetch and parse RSS feed
app.get('/feed', async (req, res) => {
    const feedUrl = req.query.url;
    if (!feedUrl) {
        return res.status(400).json({ error: 'Missing url parameter' });
    }
    try {
        const response = await axios.get(feedUrl, { timeout: 10000 });
        xml2js.parseString(response.data, { trim: true, explicitArray: false }, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to parse RSS feed' });
            }
            res.json(result);
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch RSS feed' });
    }
});


app.get('/weather', async (req, res) => {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Missing latitude or longitude parameter' });
    }

    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode,relative_humidity_2m,precipitation,precipitation_probability,uv_index,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,uv_index_max&start_date=${startDate}&end_date=${endDate}&timezone=auto`;
    try {
        const response = await axios.get(url, { timeout: 10000 });
        const data = response.data;

        const hourly = [];
        if (data.hourly && data.hourly.time) {
            for (let i = 0; i < data.hourly.time.length; i++) {
                // Only today
                if (data.hourly.time[i].startsWith(startDate)) {
                    hourly.push({
                        time: data.hourly.time[i],
                        temperature: data.hourly.temperature_2m[i],
                        weathercode: data.hourly.weathercode[i],
                        relative_humidity: data.hourly.relative_humidity_2m[i],
                        precipitation: data.hourly.precipitation[i],
                        precipitation_probability: data.hourly.precipitation_probability[i],
                        uv_index: data.hourly.uv_index[i],
                        windspeed_max: data.hourly.windspeed_10m[i]
                    });
                }
            }
        }

        const daily = [];
        if (data.daily && data.daily.time) {
            for (let i = 0; i < data.daily.time.length; i++) {
                daily.push({
                    date: data.daily.time[i],
                    temperature_max: data.daily.temperature_2m_max[i],
                    temperature_min: data.daily.temperature_2m_min[i],
                    precipitation_sum: data.daily.precipitation_sum[i],
                    precipitation_probability_max: data.daily.precipitation_probability_max[i],
                    uv_index_max: data.daily.uv_index_max[i]
                });
            }
        }

        res.json({
            hourly_today: hourly,
            daily_next_7_days: daily
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});