import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from datetime import datetime
import sys
import json

# Your data
dates = sys.argv[1]
data = json.loads(sys.argv[2])
variables = sys.argv[3]

# Split the string dates into a list
dates = dates.split(',')
variables = variables.split(',')

# Convert string dates to datetime objects
dates = [datetime.strptime(date, "%m-%d-%Y %H:%M") for date in dates]

# Create a figure and a set of subplots
fig, ax = plt.subplots(figsize=(20,6))

plot_data = []

for variable in variables:
    series = data[variable]
    # Plot data
    ax.plot(dates, series, label=variable)

    # Convert datetime objects to strings and add the data to the plot_data list
    plot_data.append({"x": [date.strftime("%m-%d-%Y %H:%M") for date in dates], "y": series, "type": "scatter", "name": variable})

ax.legend()

# Set labels
ax.set(xlabel="Date")

# Automatically set the maximum number of labels on the x-axis
ax.xaxis.set_major_locator(ticker.MaxNLocator(6))

# Print the plot data in JSON format
print(json.dumps(plot_data))
