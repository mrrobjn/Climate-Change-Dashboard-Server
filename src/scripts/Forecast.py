from datetime import datetime
from flask import Flask, request, jsonify
import pymongo
from bson import ObjectId, json_util
from pprint import pprint

app = Flask(__name__)

# Kết nối đến MongoDB
myclient = pymongo.MongoClient("mongodb://localhost:27017/CCD")

mycollection = myclient.CCD["fore-cast"]

@app.route('/forecast', methods=['POST'])
def historical_data():
    try:
        req_data = request.get_json()

        latitude = req_data.get('latitude')
        longitude = req_data.get('longitude')
        
        componentH = req_data.get('hourly')
        componentH = componentH.split(',')
        
        componentD = req_data.get('daily')
        componentD = componentD.split(',')
        
        query = {
            "$and": 
            [
                {"latitude": latitude},
                {"longitude": longitude},
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
        return json_data
    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run()
    