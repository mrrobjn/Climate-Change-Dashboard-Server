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

mycollection = myclient.CCD["forecast"]

latitude = float(sys.argv[1])
longitude = float(sys.argv[2])
        
componentH = sys.argv[3]
componentH = componentH.split(',')

componentD = sys.argv[4]
componentD = componentD.split(',')
        
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

result = {
    "latitude": latitude, 
    "longitude": longitude,
    "hourly": {"time": []}, 
    "daily": {"time": []}
}

for record in result_data:
    result["hourly"]["time"].extend(record.get("hourly", {}).get("time", []))
    result["daily"]["time"].extend(record.get("daily", {}).get("time", []))
    for c in componentH:
        if c:
            result["hourly"][c] = result["hourly"].get(c, []) + record["hourly"].get(c, [])
    for c in componentD:
        if c:
            result["daily"][c] = result["daily"].get(c, []) + record["daily"].get(c, [])

json_data = json_util.dumps(result)

data = json.loads(json_data, object_hook=json_util.object_hook)

plt.figure(figsize=(15, 8))

# Hàng giờ
for component in componentH:
    plt.plot(data["hourly"]["time"], data["hourly"][component], label=f'H-{component}', marker='o')
for component in componentD:
    plt.plot(data["daily"]["time"], data["daily"][component], label=f'D-{component}', marker='o')
# Thêm tiêu đề và nhãn
plt.title(' Historical Air Quality Components Over Time')
plt.xlabel('Time')
plt.ylabel('Concentration')
plt.legend()
plt.xticks(rotation=45)

# Tự động điều chỉnh layout để tránh việc chồng lên nhau
plt.tight_layout()

# Hiển thị biểu đồ
plt.show()
