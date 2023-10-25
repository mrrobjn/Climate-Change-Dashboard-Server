import numpy as np
from sklearn.linear_model import LinearRegression
import sys

# Your temperature data
temps = [13.4, 13, 12.9, 13, 13, 13.2, 13.5, 14.2, 15]


# Create an array with the number of hours since the start of your data
hours = np.array(range(len(temps))).reshape(-1, 1)

# Create a linear regression model and fit it to your data
model = LinearRegression()
model.fit(hours, temps)

# Now you can predict the temperature for a future hour
future_hour = np.array([len(temps) + 1]).reshape(-1, 1)
predicted_temp = model.predict(future_hour)
print (predicted_temp)


# print(sys.executable)