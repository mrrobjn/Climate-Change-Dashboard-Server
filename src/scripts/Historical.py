from datetime import datetime
import pymongo
from bson import  json_util
from pprint import pprint
import matplotlib.pyplot as plt
from datetime import datetime
import json
from bson import json_util
import sys

# Kết nối đến MongoDB
myclient = pymongo.MongoClient("mongodb://localhost:27017/CCD")

mycollection = myclient.CCD["historical"]


latitude = float(sys.argv[1])
longitude = float(sys.argv[2])

start_date = sys.argv[5]
end_date = sys.argv[6]
        
componentH = sys.argv[3]
        

componentH = componentH.split(',')

componentD = sys.argv[4]
componentD = componentD.split(',')

start_datetime = datetime.strptime(f"{start_date} 00:00:00", "%Y-%m-%d %H:%M:%S")

end_datetime = datetime.strptime(f"{end_date} 00:00:00", "%Y-%m-%d %H:%M:%S")
min_latitude =latitude-0.5
max_latitude =latitude +0.5
min_longitude = longitude -0.5
max_longitude = longitude+0.5
query = {
    "$and": [
        {"latitude": {"$gte": min_latitude, "$lte": max_latitude}},
        {"longitude": {"$gte": min_longitude, "$lte": max_longitude}},
    ]
}

data = mycollection.find(query)
result_data = [record for record in data]

# Hourly
tmpH = []   
time_positionsH = []
for record in result_data:
    if "hourly" in record:
        tmpH.append(record["hourly"]["time"])
if tmpH:
    for idx, row in enumerate(tmpH[0]):
        if start_datetime <= row <= end_datetime:
            time_positionsH.append(idx)

    components_dataH = {}
    for c in componentH:
        components_dataH[c] = [record["hourly"][c][idx] for idx in time_positionsH]

# Daily
tmpD = []   
time_positionsD = []
for record in result_data:
    if "daily" in record:
        tmpD.append(record["daily"]["time"])
if tmpD:
    # Lấy vị trí của thời gian trong khoảng từ start_datetime đến end_datetime
    for idx, row in enumerate(tmpD[0]):
        if start_datetime <= row <= end_datetime:
            time_positionsD.append(idx)
    # Lấy dữ liệu của các thành phần khác từ các vị trí đã xác định
    components_dataD = {}
    for c in componentD:
        components_dataD[c] = [record["daily"][c][idx] for idx in time_positionsD]

result = {
    "latitude": latitude,
    "longitude": longitude,
    "hourly": {
        "time": [row for row in tmpH[0] if start_datetime <= row <= end_datetime],
        **components_dataH
    },
    "daily": {
        "time": [row for row in tmpD[0] if start_datetime <= row <= end_datetime],
        **components_dataD
    },
}

json_data = json_util.dumps(result)
data = json.loads(json_data, object_hook=json_util.object_hook)

hourly_components = [key for key in data["hourly"] if key != "time"]
daily_components = [key for key in data["daily"] if key != "time"]

chart_type = sys.argv[7] 
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

for component in hourly_components:
    plot_function = chart_types_mapping.get(chart_type, plt.plot)
    
    plot_function(data["hourly"]["time"], data["hourly"][component], label=f"hourly {component} ({component_unitsH[component]})")

    plot_data.append({
        "x": [row.strftime("%Y-%m-%d %H:%M:%S") for row in data["hourly"]["time"]],
        "y": data["hourly"][component],
        "type": chart_type,
        "name": f"hourly {component} ({component_unitsH[component]})"
    })

# Plot daily components
for component in daily_components:
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