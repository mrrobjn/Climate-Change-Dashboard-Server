import sys
import os
from lida import Manager, llm
import matplotlib.pyplot as plt
import base64
from io import BytesIO

os.environ['COHERE_API_KEY'] = 'MR15LMwLvq4ez77b4Df0T8s5zMK3qbv2Nv3xhL5k'

# Get the CSV file path from the arguments
csv_file_path = "C:\\Users\\USER\\Desktop\\archive.csv"

# Initialize the LIDA manager
lida = Manager(text_gen = llm("cohere"))

# Summarize the data in your CSV file
summary = lida.summarize(csv_file_path)

# Generate visualization goals
goals = lida.goals(summary, n=2)
# Generate visualizations for the first goal
print(goals[0])
chart_codes = lida.visualize(summary=summary, goal=goals[0])

# Execute each code string and save the resulting plot
for chart_code in chart_codes:
    if isinstance(chart_code, str):
        exec(chart_code)
        plt.show()  # This will display the plot


