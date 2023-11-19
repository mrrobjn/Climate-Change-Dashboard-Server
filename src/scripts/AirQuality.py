from datetime import datetime
import pymongo
from bson import json_util
import matplotlib.pyplot as plt
import json
import sys

# Kết nối đến MongoDB
myclient = pymongo.MongoClient("mongodb://localhost:27017/CCD")

mycollection = myclient.CCD["air-quality"]

mycollection.create_index([("location", "2dsphere")])

latitude = float(sys.argv[1])
longitude = float(sys.argv[2])

component = sys.argv[3]
component = component.split(',')
start_date = sys.argv[4]
end_date = sys.argv[5]

start_datetime = datetime.strptime(f"{start_date} 00:00:00", "%Y-%m-%d %H:%M:%S")
end_datetime = datetime.strptime(f"{end_date} 23:00:00", "%Y-%m-%d %H:%M:%S")

query = {
    "location": {
        "$near": {
            "$geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            },
        }
    },
        "$or": [
        {"hourly.time": {"$gte": start_datetime, "$lte": end_datetime}},
    ]
    
}

data = mycollection.find(query)
result_data = [record for record in data]
if not result_data:
    print("No data found for the specified location and date range.")
    sys.exit(1)
    
tmp = []
time_positions = []

for record in result_data:
    if "hourly" in record:
        tmp.append(record["hourly"]["time"])

if tmp:
    # Lấy vị trí của thời gian trong khoảng từ start_datetime đến end_datetime
    for idx, row in enumerate(tmp[0]):
        if start_datetime <= row <= end_datetime:
            time_positions.append(idx)

    # Lấy dữ liệu của các thành phần khác từ các vị trí đã xác định
    components_data = {}
    for c in component:
        components_data[c] = [record["hourly"][c][idx] for idx in time_positions]

    result = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": {
            "time": [row for row in tmp[0] if start_datetime <= row <= end_datetime],
            **components_data
        }
    }

json_data = json_util.dumps(result)
data = json.loads(json_data, object_hook=json_util.object_hook)
components = [key for key in data["hourly"] if key != "time"]

chart_type = sys.argv[6] 

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

component_units = {c: result_data[0]["hourly_units"][c] for c in component}

plt.figure(figsize=(10, 6))
plot_data = []

for component in components:
    plot_function = chart_types_mapping.get(chart_type, plt.plot)
    
    plot_function(data["hourly"]["time"], data["hourly"][component], label=f"{component} ({component_units[component]})")

    plot_data.append({
        "x": [row.strftime("%Y-%m-%d %H:%M:%S") for row in data["hourly"]["time"]],
        "y": data["hourly"][component],
        "type": chart_type,
        "name": f"{component} ({component_units[component]})"
    })


plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()

print(json.dumps(plot_data))
