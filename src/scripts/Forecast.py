
import pymongo
from bson import  json_util
from pprint import pprint
import matplotlib.pyplot as plt
import json
import sys


myclient = pymongo.MongoClient("mongodb://localhost:27017/CCD")

mycollection = myclient.CCD["forecast"]
mycollection.create_index([("location", "2dsphere")])
latitude = float(sys.argv[1])
longitude = float(sys.argv[2])

componentH = sys.argv[3]
componentD = sys.argv[4]

if componentH:
    componentH = componentH.split(',')

if componentD:
    componentD = componentD.split(',')

query = {
    "location": {
        "$near": {
            "$geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            },
        }
    }
}
data = mycollection.find(query)
result_data = [record for record in data]

result = {
    "latitude": latitude,
    "longitude": longitude,
    "hourly": {"time": []},
    "daily": {"time": []}
}

for record in result_data:
    result["hourly"]["time"].extend(record.get("hourly", {}).get("time", []))
    result["daily"]["time"].extend(record.get("daily", {}).get("time", []))

    if componentH:
        for c in componentH:
            if c:
                result["hourly"][c] = result["hourly"].get(c, []) + record["hourly"].get(c, [])

    if componentD:
        for c in componentD:
            if c:
                result["daily"][c] = result["daily"].get(c, []) + record["daily"].get(c, [])

json_data = json_util.dumps(result)

data = json.loads(json_data, object_hook=json_util.object_hook)

chart_type = sys.argv[5]

# Check if chart_type is valid
valid_chart_types = ["line", "bar"]
if chart_type and chart_type not in valid_chart_types:
    print(f"Invalid chart type. Supported types: {', '.join(valid_chart_types)}.")
    sys.exit(1)

# Define a dictionary to map chart types to plotting functions
chart_types_mapping = {
    "line": plt.plot,
    "bar": plt.bar,
}

plot_function = chart_types_mapping.get(chart_type, plt.plot)
component_unitsH = {c: result_data[0]["hourly_units"][c] for c in componentH}
component_unitsD = {c: result_data[0]["daily_units"][c] for c in componentD}

plt.figure(figsize=(10, 6))
plot_data = []

# Plot hourly components
if componentH:
    for component in componentH:
        plot_function = chart_types_mapping.get(chart_type, plt.plot)
        plot_function(data["hourly"]["time"], data["hourly"][component], label=f"hourly {component} ({component_unitsH[component]})")
        plot_data.append({
            "x": [row.strftime("%Y-%m-%d %H:%M:%S") for row in data["hourly"]["time"]],
            "y": data["hourly"][component],
            "type": chart_type,
            "name": f"hourly {component} ({component_unitsH[component]})"
        })

# Plot daily components
if componentD:
    for component in componentD:
        plot_function = chart_types_mapping.get(chart_type, plt.plot)
        plot_function(data["daily"]["time"], data["daily"][component], label=f"daily {component} ({component_unitsD[component]})")

        plot_data.append({
            "x": [row.strftime("%Y-%m-%d") for row in data["daily"]["time"]],
            "y": data["daily"][component],
            "type": chart_type,
            "name": f"daily {component} ({component_unitsD[component]})"
        })

plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()
print(json.dumps(plot_data))
