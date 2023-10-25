import sys
from lida import llm, Manager

# Get the CSV file path from the arguments
csv_file_path = sys.argv[1]

# Instantiate the language model
text_gen = llm(provider="hf", model="uukuguy/speechless-llama2-hermes-orca-platypus-13b", device_map="auto")

# Create a LIDA manager
lida = Manager(llm=text_gen)

# Summarize the data
summary = lida.summarize(csv_file_path)

# Generate potential visualization goals
goals = lida.goals(summary, n=5)

# Print the goals
for i, goal in enumerate(goals):
    print(f"Goal {i+1}: {goal}")
