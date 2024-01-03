from datetime import datetime
import pymongo
from pprint import pprint
import matplotlib.pyplot as plt
from datetime import datetime
import json
import sys

myclient = pymongo.MongoClient("mongodb://localhost:27017/CCD")

mycollection = myclient.CCD["historical"]
mycollection.create_index([("location", "2dsphere")])
latitude = float(sys.argv[1])
longitude = float(sys.argv[2])
componentH = sys.argv[3]
componentD = sys.argv[4]
start_date = sys.argv[5]
end_date = sys.argv[6]
chart_type = sys.argv[7]
start_datetime = datetime.strptime(f"{start_date} 00:00:00", "%Y-%m-%d %H:%M:%S")
end_datetime = datetime.strptime(f"{end_date} 00:00:00", "%Y-%m-%d %H:%M:%S")

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
data = mycollection.find(query).limit(1)
result_data = [record for record in data]

# Xử lý dữ liệu hàng giờ nếu componentH không rỗng
if componentH:
    componentH = componentH.split(',')
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

# Xử lý dữ liệu hàng ngày nếu componentD không rỗng
if componentD:
    componentD = componentD.split(',')
    tmpD = []   
    time_positionsD = []
    for record in result_data:
        if "daily" in record:
            tmpD.append(record["daily"]["time"])
    
    if tmpD:
        for idx, row in enumerate(tmpD[0]):
            if start_datetime <= row <= end_datetime:
                time_positionsD.append(idx)
        
        components_dataD = {}
        for c in componentD:
            components_dataD[c] = [record["daily"][c][idx] for idx in time_positionsD]

result = {
    "latitude": latitude,
    "longitude": longitude,
}

if componentH:
    result["hourly"] = {
        "time": [row for row in tmpH[0] if start_datetime <= row <= end_datetime],
        **components_dataH
    }

if componentD:
    result["daily"] = {
        "time": [row for row in tmpD[0] if start_datetime <= row <= end_datetime],
        **components_dataD
    }

valid_chart_types = ["line", "bar"]
if chart_type and chart_type not in valid_chart_types:
    print(f"Loại biểu đồ không hợp lệ. Loại hỗ trợ: {', '.join(valid_chart_types)}.")
    sys.exit(1)

chart_types_mapping = {
    "line": plt.plot,
    "bar": plt.bar,
}

plot_function = chart_types_mapping.get(chart_type, plt.plot)


component_unitsH = {c: result_data[0]["hourly_units"][c] for c in componentH}
component_unitsD = {c: result_data[0]["daily_units"][c] for c in componentD}
plt.figure(figsize=(10, 6))
plot_data = []

# Vẽ đồ thị cho các thành phần hàng giờ
if componentH:
    for component in componentH:
        plot_function(result["hourly"]["time"], result["hourly"][component], label=f"hourly {component} ({component_unitsH[component]})")
        plot_data.append({
            "x": [row.strftime("%Y-%m-%d %H:%M:%S") for row in result["hourly"]["time"]],
            "y": result["hourly"][component],
            "type": chart_type,
            "name": f"hourly {component} ({component_unitsH[component]})"
        })

# Vẽ đồ thị cho các thành phần hàng ngày
if componentD:
    for component in componentD:
        plot_function(result["daily"]["time"], result["daily"][component], label=f"daily {component} ({component_unitsD[component]})")
        plot_data.append({
            "x": [row.strftime("%Y-%m-%d") for row in result["daily"]["time"]],
            "y": result["daily"][component],
            "type": chart_type,
            "name": f"daily {component} ({component_unitsD[component]})"
        })


plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()
print(json.dumps(plot_data))