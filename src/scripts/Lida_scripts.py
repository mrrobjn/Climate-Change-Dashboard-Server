from lida import Manager, TextGenerationConfig, llm
from lida.utils import plot_raster
import sys
import pandas as pd
import json
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8")


class Goal:
    def __init__(self, question, visualization, rationale, index):
        self.question = question
        self.visualization = visualization
        self.rationale = rationale
        self.index = index


df = pd.read_csv(sys.argv[1], encoding="utf-8")
key = sys.argv[2]

text_gen = llm(provider="cohere", api_key=key)

lida = Manager(text_gen=text_gen)

textgen_config = TextGenerationConfig(
    n=1, temperature=0.5, model="gpt-3.5-turbo-0301", use_cache=True
)

summary = lida.summarize(data=df, textgen_config=textgen_config)
print(json.dumps(summary).encode("utf-8").decode("utf-8"))

goals = lida.goals(summary, n=5)
goals_dicts = [vars(goal) for goal in goals]
print(json.dumps(goals_dicts).encode("utf-8").decode("utf-8"))
