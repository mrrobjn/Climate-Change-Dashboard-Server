from datetime import datetime
from flask import Flask, request, jsonify
import pymongo
from bson import ObjectId, json_util
from pprint import pprint
import matplotlib.pyplot as plt
from datetime import datetime
import json
from bson import json_util
import sys
app = Flask(__name__)

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

# Vẽ biểu đồ cho hourly và daily
plt.figure(figsize=(15, 8))

# Hàng giờ
for component in hourly_components:
    plt.plot(data["hourly"]["time"], data["hourly"][component], label=f'H-{component}', marker='o')

# Hàng ngày
for component in daily_components:
    plt.plot(data["daily"]["time"], data["daily"][component], label=f'D-{component}', marker='o')

plt.title(' Historical Air Quality Components Over Time')
plt.xlabel('Time')
plt.ylabel('Concentration')
plt.legend()
plt.xticks(rotation=45)

plt.tight_layout()

# Hiển thị biểu đồ
plt.show()

