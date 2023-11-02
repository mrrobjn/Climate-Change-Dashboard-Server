from lida import Manager, TextGenerationConfig, llm
from lida.utils import plot_raster
import sys
import pandas as pd
import json

class Goal:
    def __init__(self, question, visualization, rationale, index):
        self.question = question
        self.visualization = visualization
        self.rationale = rationale
        self.index = index


df = pd.read_csv(sys.argv[1], encoding="utf-8")

lida = Manager(
    text_gen=llm(provider="cohere", api_key="MR15LMwLvq4ez77b4Df0T8s5zMK3qbv2Nv3xhL5k")
)

summary = lida.summarize(data=df)

goals = lida.goals(summary, n=3)



print(json.dumps(summary).encode("utf-8").decode("utf-8"))
# Convert to list of dictionaries
goals_dicts = [vars(goal) for goal in goals]

# Now goals_dicts is a list of dictionaries representing your Goal objects
print(json.dumps(goals_dicts).encode("utf-8").decode("utf-8"))


# chartsArr = []
# for goal in goals:
#     charts = lida.visualize(
#         summary=summary, goal=goal, library="seaborn", textgen_config=textgen_config
#     )
#     for chart in charts:
#         if len(chart.raster) > 0:
#             chartsArr.append(chart.raster)

# print(chartsArr)
