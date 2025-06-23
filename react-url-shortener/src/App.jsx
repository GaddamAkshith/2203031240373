import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Paper,
} from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import useLogger from "./logger";

// Utility Functions
const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

const generateShortcode = () => uuidv4().slice(0, 6);

function loadUrlMap() {
  const stored = localStorage.getItem("urlMap");
  return stored ? JSON.parse(stored) : {};
}

function saveUrlMap(map) {
  localStorage.setItem("urlMap", JSON.stringify(map));
}

// Main URL Shortener Component
function URLShortener() {
  const [inputs, setInputs] = useState([{ id: 1, url: "", validity: "", shortcode: "" }]);
  const [results, setResults] = useState([]);
  const [urlMap, setUrlMap] = useState(loadUrlMap());
  const log = useLogger();

  const handleInputChange = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < 5) {
      setInputs([...inputs, { id: uuidv4(), url: "", validity: "", shortcode: "" }]);
    }
  };

  const handleSubmit = () => {
    const newResults = [];
    const newMap = { ...urlMap };

    for (const input of inputs) {
      if (!validateUrl(input.url)) {
        alert(`Invalid URL: ${input.url}`);
        log(`Invalid URL submitted: ${input.url}`);
        return;
      }

      let shortcode = input.shortcode || generateShortcode();
      if (!/^[a-zA-Z0-9]{1,20}$/.test(shortcode)) {
        alert(`Invalid shortcode: ${shortcode}`);
        log(`Invalid shortcode input: ${shortcode}`);
        return;
      }

      if (newMap[shortcode]) {
        alert(`Shortcode already in use: ${shortcode}`);
        log(`Duplicate shortcode attempted: ${shortcode}`);
        return;
      }

      const validity = parseInt(input.validity) || 30;
      const expiry = new Date(Date.now() + validity * 60000);
      newMap[shortcode] = {
        originalUrl: input.url,
        expiry: expiry.toISOString(),
      };

      newResults.push({
        id: uuidv4(),
        originalUrl: input.url,
        shortcode,
        expiry: expiry.toLocaleString(),
      });

      log(`Shortened URL created: ${shortcode} -> ${input.url}`);
    }

    setUrlMap(newMap);
    saveUrlMap(newMap);
    setResults(newResults);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>
      {inputs.map((input, index) => (
        <Paper key={input.id} style={{ padding: 16, marginBottom: 10 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Original URL"
                fullWidth
                value={input.url}
                onChange={(e) => handleInputChange(index, "url", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Validity (min)"
                type="number"
                fullWidth
                value={input.validity}
                onChange={(e) => handleInputChange(index, "validity", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Shortcode (optional)"
                fullWidth
                value={input.shortcode}
                onChange={(e) => handleInputChange(index, "shortcode", e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Button onClick={addInput} disabled={inputs.length >= 5} variant="outlined">
        Add Another URL
      </Button>
      <Button
        onClick={handleSubmit}
        variant="contained"
        color="primary"
        style={{ marginLeft: 10 }}
      >
        Shorten URLs
      </Button>

      {results.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom style={{ marginTop: 20 }}>
            Shortened URLs
          </Typography>
          {results.map((result) => (
            <Paper key={result.id} style={{ padding: 10, marginBottom: 10 }}>
              <Typography>
                Original URL: <a href={result.originalUrl}>{result.originalUrl}</a>
              </Typography>
              <Typography>
                Short URL:{" "}
                <a href={`/${result.shortcode}`}>
                  {`${window.location.origin}/${result.shortcode}`}
                </a>
              </Typography>
              <Typography>Expires at: {result.expiry}</Typography>
            </Paper>
          ))}
        </>
      )}
    </Container>
  );
}

// Redirect Component
function RedirectHandler() {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  const log = useLogger();

  useEffect(() => {
    const storedMap = JSON.parse(localStorage.getItem("urlMap")) || {};
    const entry = storedMap[shortcode];

    if (entry && new Date(entry.expiry) > new Date()) {
      log(`Redirecting to: ${entry.originalUrl}`);
      window.location.href = entry.originalUrl;
    } else {
      alert("Short URL expired or not found");
      log(`Invalid/expired shortcode: ${shortcode}`);
      navigate("/");
    }
  }, [shortcode, navigate, log]);

  return <Typography>Redirecting...</Typography>;
}

// App Entry
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<URLShortener />} />
        <Route path="/:shortcode" element={<RedirectHandler />} />
      </Routes>
    </Router>
  );
}

export default App;
