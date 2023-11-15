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

mycollection = myclient.CCD["air-quality"]

latitude = float(sys.argv[1])
longitude = float(sys.argv[2])

component = sys.argv[3]
component = component.split(',')
start_date = sys.argv[4]
end_date = sys.argv[5]

start_datetime = datetime.strptime(f"{start_date} 00:00:00", "%Y-%m-%d %H:%M:%S")

end_datetime = datetime.strptime(f"{end_date} 23:00:00", "%Y-%m-%d %H:%M:%S")
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

# Chuyển đổi thành chuỗi trước khi vẽ biểu đồ
json_str = json_data

# Vẽ biểu đồ cho từng component
plt.figure(figsize=(10, 6))
for component in components:
    plt.plot(data["hourly"]["time"], data["hourly"][component], label=component, marker='o')

plt.xlabel('Time')
plt.ylabel('Concentration')
plt.title('Air Quality Components Over Time')
plt.legend()
plt.xticks(rotation=45)
plt.tight_layout()

# Hiển thị biểu đồ
plt.show()

    