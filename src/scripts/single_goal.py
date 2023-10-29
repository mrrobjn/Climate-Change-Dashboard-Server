from lida import Manager, TextGenerationConfig, llm
from lida.utils import plot_raster
import sys
import pandas as pd

# df = pd.read_csv(sys.argv[1])
# custom_goal = sys.argv[2]

# lida = Manager(
#     text_gen=llm(provider="cohere", api_key="MR15LMwLvq4ez77b4Df0T8s5zMK3qbv2Nv3xhL5k")
# )
# textgen_config = TextGenerationConfig(n=1, temperature=0.1, use_cache=True)

# summary = lida.summarize(data=df)

# goals = lida.goals(summary, n=5, persona=custom_goal)

# charts = lida.visualize(
#     summary=summary, goal=goals[0], library="seaborn", textgen_config=textgen_config
# )

# print(charts[0].raster)
print(sys.argv[1])
print(sys.argv[2])