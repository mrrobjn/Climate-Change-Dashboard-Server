import sys
import os
from lida import Manager, llm
import matplotlib.pyplot as plt
import base64
from io import BytesIO

os.environ['OPENAI_API_KEY'] = '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'
# Get the CSV file path from the arguments
csv_file_path = sys.argv[1]

# Initialize the LIDA manager
lida = Manager(text_gen = llm("openai")) # You can replace "openai" with other providers like "palm", "cohere", etc.

# Summarize the data in your CSV file
summary = lida.summarize(csv_file_path) # Replace "data/yourfile.csv" with the path to your CSV file

# Generate visualization goals
goals = lida.goals(summary, n=2) # This will generate 2 goals for exploratory data analysis

# Generate visualizations for the first goal
charts = lida.visualize(summary=summary, goal=goals[0]) # This will generate visualizations for the first goal

# Convert the chart to base64
for chart in charts:
    pic_IObytes = BytesIO()
    chart.savefig(pic_IObytes, format='png')
    pic_IObytes.seek(0)
    pic_hash = base64.b64encode(pic_IObytes.read())

    # Print the chart in base64 format
    print(pic_hash)

