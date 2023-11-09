from datetime import datetime
from flask import Flask, request, jsonify
import pymongo
from bson import ObjectId, json_util

app = Flask(__name__)

# Kết nối đến MongoDB
myclient = pymongo.MongoClient("mongodb://localhost:27017/CCD")

mycollection = myclient.CCD["airquality"]
@app.route('/search', methods=['POST'])
def search_data():
    try:
        req_data = request.get_json()
    
        latitude = req_data.get('latitude')
        longitude = req_data.get('longitude')
        
        start_date=req_data.get('start_date')
        end_date=req_data.get('end_date')

        start_datetime = f"{start_date}T00:00:00.000Z"
        end_datetime = f"{end_date}TT23:00:00.000Z"
       
        print(latitude)
        print(longitude)
        print(start_datetime)
        print(end_datetime)

        if not latitude or not longitude or not start_date or not end_date:
            return jsonify({'error': 'Invalid or missing parameters'})

        # Thực hiện truy vấn dựa trên tọa độ và khoảng thời gian
        query = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly.time": {
                 "$gte": start_datetime,
                 "$lte": end_datetime
            }
        }
        print(query)
        results = mycollection.find(query)
        data = [record for record in results]
        # Chuyển đổi dữ liệu thành định dạng JSON
        json_data = json_util.dumps(data)
        return json_data
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/query', methods=['POST'])
def query_weather_data():
    try:
        req_data = request.get_json()

        latitude = req_data.get('latitude')
        longitude = req_data.get('longitude')

        start_date = req_data.get('start_date')
        end_date = req_data.get('end_date')
        
        component = req_data.get('hourly')
        component = component.split(',')
        
        start_datetime = datetime.strptime(f"{start_date}T00:00:00.000+00:00", "%Y-%m-%dT%H:%M:%S.%f%z")
        end_datetime = datetime.strptime(f"{end_date}T00:00:00.000+00:00", "%Y-%m-%dT%H:%M:%S.%f%z")

        query = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly.time": {
                "$gte": start_datetime,
                "$lte": end_datetime
            },
        f"hourly.{component}": {"$exists": True}
        }

        # Chỉ trả về các trường dữ liệu bạn quan tâm
        projection = {
            "hourly.time": 1,
            f"hourly.{component}": 1,
        }

        data = mycollection.find(query, projection)

        result_data = [record for record in data]

        result = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": {
                "time": [record["hourly"]["time"] for record in result_data],
                component: [record["hourly"][component] for record in result_data]
            }
        }
        json_data = json_util.dumps(result)
        return(json_data)
    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run()
    