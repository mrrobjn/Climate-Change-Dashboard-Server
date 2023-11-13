from lida import Manager, TextGenerationConfig, llm
import sys
import pandas as pd
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf8")


class Goal:
    def __init__(self, question, visualization, rationale, index):
        self.question = question
        self.visualization = visualization
        self.rationale = rationale
        self.index = index


df = pd.read_csv(sys.argv[1], encoding="utf-8-sig")
custom_goal = sys.argv[2]
key = sys.argv[3]

lida = Manager(text_gen=llm(provider="cohere", api_key=key))

textgen_config = TextGenerationConfig(
    n=1, temperature=0.5, model="gpt-3.5-turbo-0301", use_cache=True
)

summary = lida.summarize(data=df,textgen_config=textgen_config)

goals = lida.goals(summary, n=1, persona=custom_goal)

charts = lida.visualize(
    summary=summary,
    goal=goals[0],
    library="matplotlib",
    textgen_config=TextGenerationConfig,
)
if charts and charts[0].status is True:
    print((charts[0].raster).encode("utf-8").decode("utf-8"))
    print(json.dumps(goals[0].__dict__))
