import sys
from lida import llm, Manager

# Get the CSV file path and the selected goal from the arguments
csv_file_path = sys.argv[1]
selected_goal = sys.argv[2]

# Instantiate the language model
text_gen = llm(provider="hf", model="uukuguy/speechless-llama2-hermes-orca-platypus-13b", device_map="auto")

# Create a LIDA manager
lida = Manager(llm=text_gen)

# Summarize the data
summary = lida.summarize(csv_file_path)

# Generate the visualization for the selected goal
visualization = lida.visualize(summary=summary, goal=selected_goal)

print(visualization)
