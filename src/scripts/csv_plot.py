import pandas as pd
import plotly.express as px
import numpy as np

# Specify your filename
filename = "C:\\Users\\USER\\Desktop\\archive.csv"

# Read the CSV file
data = pd.read_csv(filename)

# Convert the 'date' column to datetime type
data['date'] = pd.to_datetime(data['time'])

# Set the 'date' column as the index
data.set_index('date', inplace=True)

# Select only the numeric columns for plotting
numeric_data = data.select_dtypes(include=[np.number])

# Plot the data
fig = px.line(numeric_data, width=1000, height=600)

# Convert the plot to JSON and print it
plot_json = fig.to_json()
print(plot_json)
