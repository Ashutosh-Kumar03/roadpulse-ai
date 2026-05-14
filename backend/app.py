from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -----------------------------
# Dummy Route Data for Demo
# -----------------------------

routes = [
    {
        "id": 1,
        "name": "Route A",
        "type": "Fastest Route",
        "eta": 48,
        "toll": 135,
        "traffic_density": 65,
        "fuel": 4.2,
        "accident_risk": 20,
        "event_impact": 10
    },
    {
        "id": 2,
        "name": "Route B",
        "type": "Lowest Toll Route",
        "eta": 62,
        "toll": 0,
        "traffic_density": 35,
        "fuel": 3.5,
        "accident_risk": 8,
        "event_impact": 5
    },
    {
        "id": 3,
        "name": "Route C",
        "type": "AI Recommended Route",
        "eta": 52,
        "toll": 60,
        "traffic_density": 28,
        "fuel": 3.8,
        "accident_risk": 5,
        "event_impact": 4
    }
]


# -----------------------------
# Helper Functions
# -----------------------------

def calculate_congestion_score(route):
    toll_impact = min(route["toll"] / 2, 100)
    fuel_impact = min(route["fuel"] * 15, 100)

    score = (
        route["traffic_density"] * 0.4
        + toll_impact * 0.2
        + fuel_impact * 0.2
        + route["accident_risk"] * 0.1
        + route["event_impact"] * 0.1
    )

    return round(score, 2)


def get_traffic_level(score):
    if score <= 30:
        return "Low"
    elif score <= 60:
        return "Medium"
    elif score <= 80:
        return "High"
    else:
        return "Critical"


def get_signal_timing(level):
    if level == "Low":
        return 30
    elif level == "Medium":
        return 60
    elif level == "High":
        return 90
    else:
        return 120


# -----------------------------
# Basic Home Route
# -----------------------------

@app.route("/")
def home():
    return jsonify({
        "message": "RoadPulse AI Backend Running Successfully"
    })


# -----------------------------
# Route Comparison API
# -----------------------------

@app.route("/api/routes")
def get_routes():
    processed_routes = []

    for route in routes:
        score = calculate_congestion_score(route)
        level = get_traffic_level(score)
        signal_time = get_signal_timing(level)

        processed_routes.append({
            **route,
            "congestion_score": score,
            "traffic_level": level,
            "suggested_signal_time": signal_time
        })

    fastest_route = min(processed_routes, key=lambda x: x["eta"])
    lowest_toll_route = min(processed_routes, key=lambda x: x["toll"])
    best_route = min(processed_routes, key=lambda x: x["congestion_score"])

    toll_saved = fastest_route["toll"] - best_route["toll"]
    extra_time = best_route["eta"] - fastest_route["eta"]

    if best_route["id"] == fastest_route["id"]:
        ai_reason = "AI selected the fastest route because it has the best balance of time and congestion."
    elif best_route["id"] == lowest_toll_route["id"]:
        ai_reason = "AI selected the lowest toll route because it reduces cost and has low congestion."
    else:
        ai_reason = "AI selected this route because it balances lower congestion, reasonable toll fee, fuel usage, and travel time."

    return jsonify({
        "routes": processed_routes,
        "recommended_route": best_route,
        "fastest_route": fastest_route,
        "lowest_toll_route": lowest_toll_route,
        "ai_reason": ai_reason,
        "toll_saved_against_fastest": toll_saved,
        "extra_time_against_fastest": extra_time,
        "toll_free_available": lowest_toll_route["toll"] == 0,
        "toll_free_route": lowest_toll_route
    })


# -----------------------------
# Live Congestion Prediction API
# -----------------------------

@app.route("/api/predict", methods=["POST"])
def predict_congestion():
    data = request.get_json()

    traffic_density = float(data.get("traffic_density", 50))
    toll = float(data.get("toll", 0))
    fuel = float(data.get("fuel", 3))
    accident_risk = float(data.get("accident_risk", 0))
    event_impact = float(data.get("event_impact", 0))

    toll_impact = min(toll / 2, 100)
    fuel_impact = min(fuel * 15, 100)

    score = (
        traffic_density * 0.4
        + toll_impact * 0.2
        + fuel_impact * 0.2
        + accident_risk * 0.1
        + event_impact * 0.1
    )

    score = round(score, 2)
    level = get_traffic_level(score)
    signal_time = get_signal_timing(level)

    if level == "Low":
        recommendation = "Traffic is smooth. Continue on the selected route."
        alert_type = "No Alert"
        preventive_action = "Normal monitoring is enough."
        route_advice = "Continue using the current route."
        authority_action = "No manual intervention required."

    elif level == "Medium":
        recommendation = "Moderate congestion expected. Monitor route and prepare alternate option."
        alert_type = "Moderate Traffic Alert"
        preventive_action = "Send soft alerts to commuters and prepare alternate route suggestions."
        route_advice = "Use AI recommended route if ETA increases."
        authority_action = "Monitor signals and keep backup diversion ready."

    elif level == "High":
        recommendation = "High congestion risk. Use alternate route and increase green signal timing."
        alert_type = "High Congestion Alert"
        preventive_action = "Push alerts to commuters, suggest alternate routes, and adjust signal timing."
        route_advice = "Avoid congested corridor and shift traffic to AI recommended route."
        authority_action = "Increase green signal duration and activate traffic control team."

    else:
        recommendation = "Critical congestion risk. Activate diversion, alerts, and emergency traffic control."
        alert_type = "Critical Congestion Alert"
        preventive_action = "Activate diversions, notify commuters, prioritize emergency routes, and control signals."
        route_advice = "Avoid this route immediately. Use toll-aware AI recommended route."
        authority_action = "Deploy traffic police, create green corridor, and trigger emergency protocol."

    return jsonify({
        "congestion_score": score,
        "traffic_level": level,
        "suggested_signal_time": signal_time,
        "recommendation": recommendation,
        "alert_type": alert_type,
        "preventive_action": preventive_action,
        "route_advice": route_advice,
        "authority_action": authority_action
    })


# -----------------------------
# Emergency Priority API
# -----------------------------

@app.route("/api/emergency", methods=["POST"])
def emergency_priority():
    data = request.get_json()
    vehicle_type = data.get("vehicle_type", "Ambulance")

    return jsonify({
        "status": "Emergency Priority Activated",
        "vehicle_type": vehicle_type,
        "priority_route": "Route C",
        "signals_turned_green": ["Signal A", "Signal B", "Signal C"],
        "estimated_clearance_time": "4 minutes",
        "message": f"{vehicle_type} has been given green corridor access."
    })


# -----------------------------
# Run Server
# -----------------------------

if __name__ == "__main__":
    app.run(debug=True)