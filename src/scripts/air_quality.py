import matplotlib.pyplot as plt
from matplotlib.dates import HourLocator, DateFormatter
import matplotlib.ticker as ticker
import base64
from io import BytesIO
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

for variable in variables:
    series = data[variable]
    # Plot data
    ax.plot(dates, series, label=variable)

ax.legend()

# Set labels
# ax.set(xlabel="Date", ylabel="Temperature", title="Temperature over time")
ax.set(xlabel="Date")

# Automatically set the maximum number of labels on the x-axis
ax.xaxis.set_major_locator(ticker.MaxNLocator(10))
# Save the figure to a BytesIO object
buf = BytesIO()
plt.savefig(buf, format="png",bbox_inches="tight")
buf.seek(0)

# Convert the BytesIO object to a base64 string
image_base64 = base64.b64encode(buf.read()).decode("utf-8")

print(image_base64)