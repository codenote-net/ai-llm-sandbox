# I tried GPT Researcher

[GPT Researcher Quickstart at v0\.1\.4](https://github.com/assafelovic/gpt-researcher/tree/v0.1.4?tab=readme-ov-file#quickstart)を試しました。

```sh
git clone https://github.com/assafelovic/gpt-researcher.git
cd gpt-researcher
```

```sh
git switch -c v0.1.4 refs/tags/v0.1.4
```

```sh
asdf local python 3.10.13
```

```sh
python -m venv .venv
source .venv/bin/activate
```

```sh
python -m pip install -r requirements.txt
```

```sh
touch .env
```

`.env` に以下のように環境変数を設定します。

API Keyは以下のURLから取得できます。

- https://platform.openai.com/api-keys
- https://app.tavily.com/sign-in


```
OPENAI_API_KEY={Your OpenAI API Key here}
TAVILY_API_KEY={Your Tavily API Key here}
```

```sh
python -m uvicorn main:app --reload
```

```sh
open http://127.0.0.1:8000
```

あとは、Webブラウザ上でGPT Researcherを使ってみながら、コードリーディングしました。

以上、GPT Researcherを使ってみた、現場からお送りしました。
