from langserve import RemoteRunnable

remote_chain = RemoteRunnable("http://localhost:8000/category_chain/")
result = remote_chain.invoke({"text": "colors"})
# >> ['red', 'blue', 'green', 'yellow', 'orange']

print(result)
