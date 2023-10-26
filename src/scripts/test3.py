import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import matplotlib.ticker as ticker
import base64
from io import BytesIO
from datetime import datetime

# Your data
dates = [
    "2023-01-01",
    "2023-01-02",
    "2023-01-03",
    "2023-01-04",
    "2023-01-05",
    "2023-01-06",
    "2023-01-07",
    "2023-01-08",
    "2023-01-09",
    "2023-01-10",
    "2023-01-11",
]
# Convert string dates to datetime objects
dates = [datetime.strptime(date, "%Y-%m-%d") for date in dates]
temps = [20, 21, 19, 24, 65, 23, 12, 43,21,12,23]

# Create a figure and a set of subplots
fig, ax = plt.subplots()

# Plot data
ax.plot(dates, temps)

# Set labels
ax.set(xlabel="Date", ylabel="Temperature", title="Temperature over time")

# Automatically set the maximum number of labels on the x-axis
ax.xaxis.set_major_locator(ticker.MaxNLocator(6))

# Save the figure to a BytesIO object
buf = BytesIO()
plt.savefig(buf, format="png")
buf.seek(0)

# Convert the BytesIO object to a base64 string
image_base64 = base64.b64encode(buf.read()).decode("utf-8")

print(image_base64)
