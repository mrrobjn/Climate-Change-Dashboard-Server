from lida import Manager, llm
import sys
import pandas as pd

df = pd.read_csv(sys.argv[1])
custom_goal = sys.argv[2]
instructions = sys.argv[3]

lida = Manager(
    text_gen=llm(provider="cohere", api_key="MR15LMwLvq4ez77b4Df0T8s5zMK3qbv2Nv3xhL5k")
)
summary = lida.summarize(df=df)

goals = lida.goals(summary, n=5, persona=custom_goal)

charts = lida.visualize(summary=summary, goal=goals[0], library="matplotlib")

edited_charts = lida.edit(
    code=charts[0].code,
    summary=summary,
    instructions=instructions,
    library="matplotlib",
)

if edited_charts and edited_charts[0].status is True:
    print(edited_charts[0].raster)
