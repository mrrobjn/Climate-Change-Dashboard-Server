from datetime import datetime
from flask import Flask, request, jsonify
import pymongo
from bson import ObjectId, json_util

app = Flask(__name__)

# Kết nối đến MongoDB
myclient = pymongo.MongoClient("mongodb://localhost:27017/CCD")

mycollection = myclient.CCD["air-quality"]
@app.route('/search_data', methods=['POST'])
def search_data():
    try:
        req_data = request.get_json()
    
        latitude = req_data.get('latitude')
        longitude = req_data.get('longitude')
        
        
        start_date=req_data.get('start_date')
        end_date=req_data.get('end_date')

        start_datetime = f"{start_date}T00:00"
        end_datetime = f"{end_date}T23:00"

       
        print(latitude)
        print(longitude)
        print(start_datetime)
        print(end_datetime)

        if not latitude or not longitude or not start_date or not end_date:
            return jsonify({'error': 'Invalid or missing parameters'})

        # Thực hiện truy vấn dựa trên tọa độ và khoảng thời gian
        results = mycollection.find({
            "latitude": latitude,
            "longitude": longitude,
            "hourly.time": {
                "$gte": start_datetime,
                "$lte": end_datetime
            }
        })

        
        data = [record for record in results]

        # Chuyển đổi dữ liệu thành định dạng JSON
        json_data = json_util.dumps(data)
        print(json_data)
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
        
        components_to_query = req_data.get('hourly')

        start_datetime = f"{start_date}T00:00"
        end_datetime = f"{end_date}T23:00"

        if not latitude or not longitude or not start_date or not end_date:
            return jsonify({'error': 'Invalid or missing parameters'})

        components_to_query = components_to_query.split(',')

        # Tạo truy vấn cho mỗi thành phần và khoảng thời gian
        queries = []
        for component in components_to_query:
            query = {
                "latitude": latitude,
                "longitude": longitude,
                "hourly.time": {
                    "$gte": start_datetime,
                    "$lte": end_datetime
                },
                f"hourly.{component}": {"$exists": True}
            }
            queries.append(query)

        # Thực hiện các truy vấn và lấy dữ liệu
        results = {}
        for query, component in zip(queries, components_to_query):
            data = mycollection.find(query, {f"_id": 0, f"hourly.{component}": 1, "hourly.time": 1})
            result_data = [record for record in data]
           # print(req_data)
            result = {
                "latitude": latitude,
                "longitude": longitude,
                "hourly": {
                    "time": [record["hourly"]["time"] for record in result_data],
                    component: [record["hourly"][component] for record in result_data]
                }
            }
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run()
    