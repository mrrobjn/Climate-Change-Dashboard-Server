from datetime import datetime
from flask import Flask, request, jsonify
import pymongo
from bson import ObjectId, json_util
from pprint import pprint

app = Flask(__name__)

# Kết nối đến MongoDB
myclient = pymongo.MongoClient("mongodb://localhost:27017/CCD")

mycollection = myclient.CCD["historical"]

@app.route('/historical', methods=['POST'])
def historical_data():
    try:
        req_data = request.get_json()

        latitude = req_data.get('latitude')
        longitude = req_data.get('longitude')

        start_date = req_data.get('start_date')
        end_date = req_data.get('end_date')
        
        componentH = req_data.get('hourly')
        componentH = componentH.split(',')
        
        componentD = req_data.get('daily')
        componentD = componentD.split(',')
        
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
        
        #Hourly
        tmpH = []   
        time_positionsH = []
        for record in result_data:
            if "hourly" in record:
                tmpH.append(record["hourly"]["time"])
        if tmpH:
            # Lấy vị trí của thời gian trong khoảng từ start_datetime đến end_datetime
            for idx, row in enumerate(tmpH[0]):
                if start_datetime <= row <= end_datetime:
                    time_positionsH.append(idx)
            # Lấy dữ liệu của các thành phần khác từ các vị trí đã xác định
            components_dataH = {}
            for c in componentH:
                components_dataH[c] = [record["hourly"][c][idx] for idx in time_positionsH]

        #Daily
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
        return(json_data)
    except Exception as e:
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run()
    