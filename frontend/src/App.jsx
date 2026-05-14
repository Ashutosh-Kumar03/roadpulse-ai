import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [routes, setRoutes] = useState([]);
  const [recommendedRoute, setRecommendedRoute] = useState(null);
  const [routeInsights, setRouteInsights] = useState(null);
  const [emergencyStatus, setEmergencyStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [predictionInput, setPredictionInput] = useState({
  traffic_density: 70,
  toll: 60,
  fuel: 3.8,
  accident_risk: 10,
  event_impact: 15,
});

const [customPrediction, setCustomPrediction] = useState(null);

  const fetchRoutes = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/routes");
      setRoutes(response.data.routes);
      setRecommendedRoute(response.data.recommended_route);
      setRouteInsights({
  fastestRoute: response.data.fastest_route,
  lowestTollRoute: response.data.lowest_toll_route,
  aiReason: response.data.ai_reason,
  tollSaved: response.data.toll_saved_against_fastest,
  extraTime: response.data.extra_time_against_fastest,
  tollFreeAvailable: response.data.toll_free_available,
  tollFreeRoute: response.data.toll_free_route,
});
      setLoading(false);
    } catch (error) {
      console.error("Error fetching route data:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
  const { name, value } = e.target;

  setPredictionInput({
    ...predictionInput,
    [name]: value,
  });
};

const applyScenario = (scenario) => {
  if (scenario === "normal") {
    setPredictionInput({
      traffic_density: 35,
      toll: 30,
      fuel: 2.8,
      accident_risk: 5,
      event_impact: 5,
    });
  }

  if (scenario === "accident") {
    setPredictionInput({
      traffic_density: 85,
      toll: 60,
      fuel: 4.6,
      accident_risk: 75,
      event_impact: 20,
    });
  }

  if (scenario === "festival") {
    setPredictionInput({
      traffic_density: 92,
      toll: 90,
      fuel: 5.2,
      accident_risk: 25,
      event_impact: 85,
    });
  }

  if (scenario === "rain") {
    setPredictionInput({
      traffic_density: 78,
      toll: 45,
      fuel: 4.4,
      accident_risk: 45,
      event_impact: 35,
    });
  }

  setCustomPrediction(null);
};

const predictCustomCongestion = async () => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:5000/api/predict",
      predictionInput
    );

    setCustomPrediction(response.data);
  } catch (error) {
    console.error("Prediction failed:", error);
  }
};

  const activateEmergency = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/emergency", {
        vehicle_type: "Ambulance",
      });

      setEmergencyStatus(response.data);
    } catch (error) {
      console.error("Emergency activation failed:", error);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  if (loading) {
    return <h2 className="loading">Loading RoadPulse AI...</h2>;
  }

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="badge">AI-Powered Smart Traffic Congestion Predictor</p>
          <h1>RoadPulse AI</h1>
          <p className="subtitle">
            Predict. Prevent. Proceed.
          </p>
          <p className="description">
            A smart congestion and toll-aware route prediction system for
            smarter cities, faster emergency response, and better commuter
            decisions.
          </p>
        </div>

        <div className="hero-card">
          <h3>AI Recommended Route</h3>
          <h2>{recommendedRoute?.name}</h2>
          <p>{recommendedRoute?.type}</p>
          <div className="score">
            {recommendedRoute?.congestion_score}% Risk
          </div>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <h3>Prediction Window</h3>
          <p>30–60 min</p>
          <span>Before congestion occurs</span>
        </div>

        <div className="stat-card">
          <h3>Best Route</h3>
          <p>{recommendedRoute?.name}</p>
          <span>{recommendedRoute?.traffic_level} traffic</span>
        </div>

        <div className="stat-card">
          <h3>Estimated Toll</h3>
          <p>₹{recommendedRoute?.toll}</p>
          <span>Toll-aware decision</span>
        </div>

        <div className="stat-card">
          <h3>Signal Timing</h3>
          <p>{recommendedRoute?.suggested_signal_time}s</p>
          <span>Smart traffic control</span>
        </div>
      </section>

      <section className="panel predictor-panel">
  <div className="section-heading">
    <h2>Live Congestion Predictor</h2>
    <p>Enter real-time road conditions and get AI-based congestion forecast.</p>
  </div>

  <div className="scenario-buttons">
  <button onClick={() => applyScenario("normal")}>Normal Traffic</button>
  <button onClick={() => applyScenario("accident")}>Rain + Accident</button>
  <button onClick={() => applyScenario("festival")}>Festival Rush</button>
  <button onClick={() => applyScenario("rain")}>Heavy Rain</button>
</div>

  <div className="input-grid">
    <label>
      Traffic Density
      <input
        type="number"
        name="traffic_density"
        value={predictionInput.traffic_density}
        onChange={handleInputChange}
      />
    </label>

    <label>
      Toll Fee ₹
      <input
        type="number"
        name="toll"
        value={predictionInput.toll}
        onChange={handleInputChange}
      />
    </label>

    <label>
      Fuel Usage L
      <input
        type="number"
        name="fuel"
        value={predictionInput.fuel}
        onChange={handleInputChange}
      />
    </label>

    <label>
      Accident Risk
      <input
        type="number"
        name="accident_risk"
        value={predictionInput.accident_risk}
        onChange={handleInputChange}
      />
    </label>

    <label>
      Event Impact
      <input
        type="number"
        name="event_impact"
        value={predictionInput.event_impact}
        onChange={handleInputChange}
      />
    </label>
  </div>

  <button className="predict-btn" onClick={predictCustomCongestion}>
    Predict Congestion
  </button>

 {customPrediction && (
  <div className="prediction-result">
    <h3>Prediction Result</h3>

    <div className="prediction-summary">
      <div>
        <strong>{customPrediction.congestion_score}%</strong>
        <span>Congestion Score</span>
      </div>

      <div>
        <strong>{customPrediction.traffic_level}</strong>
        <span>Traffic Level</span>
      </div>

      <div>
        <strong>{customPrediction.suggested_signal_time}s</strong>
        <span>Signal Timing</span>
      </div>
    </div>

    <div className="smart-alert">
      <h4>{customPrediction.alert_type}</h4>
      <p>{customPrediction.recommendation}</p>
    </div>

    <div className="action-grid">
      <div>
        <h4>Preventive Action</h4>
        <p>{customPrediction.preventive_action}</p>
      </div>

      <div>
        <h4>Route Advice</h4>
        <p>{customPrediction.route_advice}</p>
      </div>

      <div>
        <h4>Authority Action</h4>
        <p>{customPrediction.authority_action}</p>
      </div>
    </div>
  </div>
)}
</section>

<section className="panel demo-panel">
  <div className="section-heading">
    <h2>Hackathon Demo Mode</h2>
    <p>Complete smart-city traffic decision flow in one view.</p>
  </div>

  <div className="demo-flow">
    <div>
      <span>01</span>
      <h3>Problem Detected</h3>
      <p>
        Traffic congestion can cause delays, fuel wastage, pollution,
        and emergency response failure.
      </p>
    </div>

    <div>
      <span>02</span>
      <h3>AI Prediction</h3>
      <p>
        RoadPulse AI predicts congestion risk using traffic density,
        toll cost, fuel usage, accidents, and event impact.
      </p>
    </div>

    <div>
      <span>03</span>
      <h3>Smart Decision</h3>
      <p>
        The system compares fastest, lowest toll, and AI recommended
        routes before suggesting the best option.
      </p>
    </div>

    <div>
      <span>04</span>
      <h3>Preventive Action</h3>
      <p>
        It recommends signal timing, route diversion, commuter alerts,
        and emergency green corridor activation.
      </p>
    </div>
  </div>
</section>

<section className="panel toll-panel">
  <div className="section-heading">
    <h2>NHAI Toll Intelligence</h2>
    <p>Compare travel time, toll cost, and AI route decision.</p>
  </div>

  {routeInsights && (
    <div className="toll-grid">
      <div className="toll-card">
        <h3>Fastest Route</h3>
        <p>{routeInsights.fastestRoute?.name}</p>
        <span>
          {routeInsights.fastestRoute?.eta} min • ₹
          {routeInsights.fastestRoute?.toll} toll
        </span>
      </div>

      <div className="toll-card">
        <h3>Lowest Toll Route</h3>
        <p>{routeInsights.lowestTollRoute?.name}</p>
        <span>
          {routeInsights.lowestTollRoute?.eta} min • ₹
          {routeInsights.lowestTollRoute?.toll} toll
        </span>
      </div>

      <div className="toll-card highlight">
        <h3>AI Recommended</h3>
        <p>{recommendedRoute?.name}</p>
        <span>
          Saves ₹{routeInsights.tollSaved} with only{" "}
          {routeInsights.extraTime} extra min
        </span>
      </div>
    </div>
  )}

  {routeInsights && (
    <div className="ai-explanation">
      <h4>Why AI selected {recommendedRoute?.name}?</h4>
      <p>{routeInsights.aiReason}</p>

      {routeInsights.tollFreeAvailable && (
        <p>
          Toll-free alternative available:{" "}
          <strong>{routeInsights.tollFreeRoute?.name}</strong>
        </p>
      )}
    </div>
  )}
</section>

      <section className="main-grid">
        <div className="panel route-panel">
          <div className="section-heading">
            <h2>Route Comparison</h2>
            <p>Fastest vs Lowest Toll vs AI Recommended</p>
          </div>

          <div className="routes">
            {routes.map((route) => (
              <div
                className={`route-card ${
                  recommendedRoute?.id === route.id ? "recommended" : ""
                }`}
                key={route.id}
              >
                <div className="route-top">
                  <div>
                    <h3>{route.name}</h3>
                    <p>{route.type}</p>
                  </div>
                  <span className={`level ${route.traffic_level.toLowerCase()}`}>
                    {route.traffic_level}
                  </span>
                </div>

                <div className="route-details">
                  <div>
                    <strong>{route.eta} min</strong>
                    <span>ETA</span>
                  </div>
                  <div>
                    <strong>₹{route.toll}</strong>
                    <span>Toll</span>
                  </div>
                  <div>
                    <strong>{route.fuel} L</strong>
                    <span>Fuel</span>
                  </div>
                  <div>
                    <strong>{route.congestion_score}%</strong>
                    <span>Risk</span>
                  </div>
                </div>

                <div className="signal-box">
                  Suggested Green Signal: {route.suggested_signal_time}s
                </div>

                {recommendedRoute?.id === route.id && (
                  <div className="ai-tag">AI Recommended</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="section-heading">
            <h2>Traffic Heatmap</h2>
            <p>Simulated congestion zones</p>
          </div>

          <div className="map-box">
  <MapContainer
    center={[28.6139, 77.209]}
    zoom={12}
    scrollWheelZoom={false}
    className="map"
  >
    <TileLayer
      attribution='&copy; OpenStreetMap contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    <CircleMarker
      center={[28.6304, 77.2177]}
      radius={18}
      pathOptions={{ color: "green", fillColor: "green", fillOpacity: 0.5 }}
    >
      <Popup>MG Road - Low Congestion</Popup>
    </CircleMarker>

    <CircleMarker
      center={[28.6129, 77.2295]}
      radius={22}
      pathOptions={{ color: "orange", fillColor: "orange", fillOpacity: 0.5 }}
    >
      <Popup>Central Avenue - Medium Congestion</Popup>
    </CircleMarker>

    <CircleMarker
      center={[28.7041, 77.1025]}
      radius={28}
      pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.5 }}
    >
      <Popup>Highway Junction - High Congestion</Popup>
    </CircleMarker>

    <CircleMarker
      center={[28.5562, 77.1]}
      radius={18}
      pathOptions={{ color: "green", fillColor: "green", fillOpacity: 0.5 }}
    >
      <Popup>Airport Road - Low Congestion</Popup>
    </CircleMarker>

    <CircleMarker
      center={[28.5355, 77.391]}
      radius={22}
      pathOptions={{ color: "orange", fillColor: "orange", fillOpacity: 0.5 }}
    >
      <Popup>City Mall Road - Medium Congestion</Popup>
    </CircleMarker>
  </MapContainer>
</div>

          <div className="legend">
            <span><b className="dot green-dot"></b> Low</span>
            <span><b className="dot yellow-dot"></b> Medium</span>
            <span><b className="dot red-dot"></b> High</span>
          </div>
        </div>
      </section>

      <section className="panel emergency-panel">
        <div>
          <h2>Emergency Vehicle Priority Mode</h2>
          <p>
            Activate a green corridor for ambulance, fire brigade, or police
            vehicle during critical movement.
          </p>
        </div>

        <button onClick={activateEmergency}>
          Activate Ambulance Priority
        </button>
      </section>

      {emergencyStatus && (
        <section className="alert-box">
          <h3>{emergencyStatus.status}</h3>
          <p>{emergencyStatus.message}</p>
          <p>
            Priority Route: <strong>{emergencyStatus.priority_route}</strong>
          </p>
          <p>
            Signals Turned Green:{" "}
            <strong>{emergencyStatus.signals_turned_green.join(", ")}</strong>
          </p>
          <p>
            Estimated Clearance Time:{" "}
            <strong>{emergencyStatus.estimated_clearance_time}</strong>
          </p>
        </section>
      )}
    </div>
  );
}

export default App;

