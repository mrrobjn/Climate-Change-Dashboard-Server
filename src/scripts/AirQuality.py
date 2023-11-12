from datetime import datetime
from flask import Flask, request, jsonify
import pymongo
from bson import ObjectId, json_util
from pprint import pprint

app = Flask(__name__)

# Kết nối đến MongoDB
myclient = pymongo.MongoClient("mongodb://localhost:27017/CCD")

mycollection = myclient.CCD["air-quality"]
@app.route('/air_quality', methods=['POST'])
def airquality_data():
    try:
        req_data = request.get_json()

        latitude = req_data.get('latitude')
        longitude = req_data.get('longitude')

        start_date = req_data.get('start_date')
        end_date = req_data.get('end_date')
        
        component = req_data.get('hourly')
        component = component.split(',')
        
        start_datetime = datetime.strptime(f"{start_date} 00:00:00", "%Y-%m-%d %H:%M:%S")
        
        end_datetime = datetime.strptime(f"{end_date} 00:00:00", "%Y-%m-%d %H:%M:%S")
        query = {
            "$and": 
            [
                {"latitude": latitude},
                {"longitude": longitude},
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
        return(json_data)
    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run()
    