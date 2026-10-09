import express from 'express';

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/', (req, res) => {
  res.json({
    message: 'Environmental Monitoring Station',
    version: '1.0'
  });
});

app.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime()
  });
});

const stations = [
  { id: 1, name: "Blue Mesa Ridge", biome: "alpine",  elevation: 3200 },
  { id: 2, name: "Dusty Flats",     biome: "desert",  elevation: 890  },
  { id: 3, name: "Pine Harbor",     biome: "coastal", elevation: 45   },
];

const readings = [
  { id: 1, stationId: 1, type: "temperature", value: -2.1, unit: "C"   },
  { id: 2, stationId: 1, type: "co2",         value: 412,  unit: "ppm" },
  { id: 3, stationId: 2, type: "temperature", value: 38.4, unit: "C"   },
  { id: 4, stationId: 2, type: "humidity",    value: 12,   unit: "%"   },
  { id: 5, stationId: 3, type: "temperature", value: 16.8, unit: "C"   },
  { id: 6, stationId: 3, type: "humidity",    value: 78,   unit: "%"   },
];

app.get('/stations', (req, res) => {
  res.json(stations);
});

app.get('/stations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const station = stations.find((station) => station.id === id);

  if (!station) {
    res.status(404).json({ error: 'Station not found' });
    return;
  }

  res.json(station);
});

app.get('/readings', (req, res) => {
  const type = req.query.type;

  if (!type) {
    res.json(readings);
    return;
  }

  const filteredReadings = readings.filter(
    (reading) => reading.type === type
  );

  res.json(filteredReadings);
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    stations,
    readings
  });
});

app.get('/stations/:id/view', (req, res) => {
  const id = parseInt(req.params.id);
  const station = stations.find(s => s.id === id);

  if (!station) {
    return res.status(404).json({ error: 'Station not found' });
  }

  const stationReadings = readings.filter(
    reading => reading.stationId === id
  );

  res.render('station', {
    station,
    readings: stationReadings
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});