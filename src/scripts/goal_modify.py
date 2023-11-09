from lida import Manager, llm, TextGenerationConfig
import sys
import pandas as pd

df = pd.read_csv(sys.argv[1])
custom_goal = sys.argv[2]
instructions = sys.argv[3].split(',')
key = sys.argv[4]

lida = Manager(
    text_gen=llm(provider="cohere", api_key=key)
)
summary = lida.summarize(data=df)

goals = lida.goals(summary, n=5, persona=custom_goal)

charts = lida.visualize(summary=summary, goal=goals[0], library="seaborn")

edited_charts = lida.edit(
    code=charts[0].code,
    summary=summary,
    instructions=instructions,
    textgen_config=TextGenerationConfig,
    library="matplotlib"
)

if edited_charts and edited_charts[0].status is True:
    print(edited_charts[0].raster)

