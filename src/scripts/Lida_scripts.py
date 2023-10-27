from lida import Manager,TextGenerationConfig , llm  
from lida.utils import plot_raster

lida = Manager(text_gen = llm(provider="cohere",api_key="MR15LMwLvq4ez77b4Df0T8s5zMK3qbv2Nv3xhL5k"))
textgen_config = TextGenerationConfig(n=1, temperature=0.2, use_cache=True)

summary = lida.summarize("https://raw.githubusercontent.com/uwdata/draco/master/data/cars.csv", summary_method="default")  

goals = lida.goals(summary, n=2)
library = "seaborn"

# for goal in goals:
charts = lida.visualize(summary=summary, goal=goals[0], library=library,textgen_config=textgen_config)

# explanations = lida.explain(code=charts[0].code  ,textgen_config=textgen_config,library=library)
print(charts[0].raster)