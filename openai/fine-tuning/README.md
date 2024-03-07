# OpenAI Fine-tuning

Fine-tuningは公開されている学習済のモデルに、独自のデータを追加で学習させて、新たな知識を蓄えたモデルを作り出す手法です。詳しくは以下の記事を参考にしてください。

[【ChatGPT】ファインチューニングをわかりやすく解説 \#ChatGPT \- Qiita](https://qiita.com/ksonoda/items/b9fd3e709aeae79629ff)

本ドキュメントでは以下の2つの記事を元にFine-tuningを試す方法をご紹介します。

- [Fine\-tuning \- OpenAI API](https://platform.openai.com/docs/guides/fine-tuning)
- [ChatGPTでファインチューニング \(Fine\-tuning\) を試してみた \- PLAY DEVELOPERS BLOG](https://developers.play.jp/entry/2023/10/20/173222)

## 事前準備

```sh
asdf local python 3.10.13
```

### OpenAIのAPI Keyを準備する

準備できたらdirenvなどで環境変数`OPENAI_API_KEY`に指定してください。

```sh
# .envrcの入力例
export OPENAI_API_KEY=sk-xxx
```

### 仮想環境を作って、必要なパッケージをインストールする

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## データセットの準備

[Preparing your dataset](https://platform.openai.com/docs/guides/fine-tuning/preparing-your-dataset)の手順に従ってデータセットを準備します。
データセットはOpenAIのドキュメントではなく [ChatGPTでファインチューニング \(Fine\-tuning\) を試してみた \- PLAY DEVELOPERS BLOG](https://developers.play.jp/entry/2023/10/20/173222) を参考にさせて頂きました。

以下を `mydata.jsonl` として保存します。

```jsonl
{"messages": [{"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"}, {"role": "user", "content": "日本の伝統的な食事について教えてください。"}, {"role": "assistant", "content": "日本の伝統的な食事は、主にご飯、お味噌汁、おかずで構成されます。おかずには魚、野菜、漬物などが含まれ、バランスが重要です。"}]}
{"messages": [{"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"}, {"role": "user", "content": "日本の伝統的な祭りについて説明してください。"}, {"role": "assistant", "content": "日本には多くの祭りがあります。たとえば、お正月には初詣が行われ、神社で祈りを捧げることが一般的です。また、夏には盆踊りや花火大会が行われ、地域ごとに様々な祭りがあります。"}]}
{"messages": [{"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"}, {"role": "user", "content": "日本の伝統的な音楽について教えてください。"}, {"role": "assistant", "content": "日本の伝統的な音楽には、雅楽、能楽、箏曲、尺八などさまざまなジャンルがあります。これらの音楽は日本の歴史や文化を反映しており、独自の美しさがあります。"}]}
{"messages": [{"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"}, {"role": "user", "content": "日本の伝統的な建築について説明してください。"}, {"role": "assistant", "content": "日本の伝統的な建築は木造で、美しい曲線と折り重なる屋根が特徴です。寺院や神社、茶室などに見られ、自然と調和するデザインが重要です。"}]}
{"messages": [{"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"}, {"role": "user", "content": "日本の伝統的な芸術について教えてください。"}, {"role": "assistant", "content": "日本の伝統的な芸術には、茶道、華道、書道、能楽などが含まれます。これらの芸術は日本文化の美意識や精神を表現する重要な要素です。"}]}
{"messages": [{"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"}, {"role": "user", "content": "日本の伝統的な神話について説明してください。"}, {"role": "assistant", "content": "日本の伝統的な神話には、天照大神や素戔嗚尊などの神々が登場します。神話には日本の起源や自然現象の説明、歴史的な出来事が含まれており、日本文化に深い影響を与えています。"}]}
{"messages": [{"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"}, {"role": "user", "content": "日本の伝統的な神社について教えてください。"}, {"role": "assistant", "content": "日本には多くの神社があり、自然や神々を祀る場所です。鳥居や拝殿などの建築物があり、参拝や祈りが行われます。有名な神社には伏見稲荷大社や熱田神宮などがあります。"}]}
{"messages": [{"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"}, {"role": "user", "content": "日本の伝統的な文化祭りについて説明してください。"}, {"role": "assistant", "content": "日本には様々な文化祭りがあり、地域ごとに異なる特色があります。たとえば、京都の祇園祭や青森のねぶた祭りなどが有名です。これらの祭りでは伝統的な衣装やパレードが行われ、多くの人々が楽しむイベントです。"}]}
{"messages": [{"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"}, {"role": "user", "content": "日本の伝統的な言語について教えてください。"}, {"role": "assistant", "content": "日本の伝統的な言語は日本語です。日本語には多くの方言があり、三つの書き言葉が一般的に使われています。それらはひらがな、カタカナ、漢字です。漢字は中国から導入された文字で、日本語の文章や詩の表現に使われます。"}]}
{"messages": [{"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"}, {"role": "user", "content": "日本の伝統的な花について説明してください。"}, {"role": "assistant", "content": "日本には多くの美しい花があり、桜が特に有名です。桜の花見は春の風物詩となり、日本中で楽しまれます。他にも梅、菊、蓮なども重要な花です。これらの花は季節や文化行事と深く結びついています。"}]}
```

## Python REPLで以下を実行します

Terminalアプリで以下を実行して、「トレーニングファイルをアップロードする」以降の手順を実行していきましょう。

```sh
python
# Python 3.10.13 (main, Jan 12 2024, 17:15:36) [Clang 15.0.0 (clang-1500.1.0.2.5)] on darwin
# Type "help", "copyright", "credits" or "license" for more information.
# >>>
```

## トレーニングファイルをアップロードする

```python
from openai import OpenAI
client = OpenAI()

client.files.create(
  file=open("mydata.jsonl", "rb"),
  purpose="fine-tune"
)
```

**実行結果**

```python
FileObject(id='file-YOURFILEID', bytes=5053, created_at=1709797826, filename='mydata.jsonl', object='file', purpose='fine-tune', status='processed', status_details=None)
```

アップロードしたファイルは[OpenAI APIのStorageページ](https://platform.openai.com/storage/files)からも確認できます。


## Fine-tuningされたモデルを作成する

[Create a fine-tuned model](https://platform.openai.com/docs/guides/fine-tuning/create-a-fine-tuned-model)

```python
from openai import OpenAI
client = OpenAI()

client.fine_tuning.jobs.create(
  training_file="file-YOURFILEID",
  model="gpt-3.5-turbo"
)
```

**Response**

```python
FineTuningJob(id='ftjob-YOURFTJOBID', created_at=1709797944, error=Error(code=None, message=None, param=None, error=None), fine_tuned_model=None, finished_at=None, hyperparameters=Hyperparameters(n_epochs='auto', batch_size='auto', learning_rate_multiplier='auto'), model='gpt-3.5-turbo-0125', object='fine_tuning.job', organization_id='org-YOURORG', result_files=[], status='validating_files', trained_tokens=None, training_file='file-YOURFILEID', validation_file=None, user_provided_suffix=None)
```

Fine-tuningの進行状況や結果は、[OpenAI APIのFine\-tuningページ](https://platform.openai.com/finetune/)からも確認できます。


今回、Fine-tuningには完了まで約7分かかりました。

```
16:59:01
The job has successfully completed
16:58:59
New fine-tuned model created: ft:gpt-3.5-turbo-0125:YOURORG::YOURFTID
16:52:49
Fine-tuning job started
16:52:47
Files validated, moving job to queued state
16:52:24
Validating training file: file-YOURFILEID
16:52:24
Created fine-tuning job: ftjob-YOURFTJOBID
```

## Fine-tuningのある時、ない時

### Fine-tuningのあるモデルを使用する

```python
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
  model="ft:gpt-3.5-turbo-0125:YOURORG::YOURFTID",
  messages=[
    {"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"},
    {"role": "user", "content": "日本の伝統的な芸術について教えてください。"}
  ]
)
print(completion.choices[0].message)
```

**実行結果**

トレーニングファイル `mydata.jsonl` に含まれるデータを元に、日本の伝統的な芸術についての回答が返ってきました。

```python
print(completion.choices[0].message)
ChatCompletionMessage(content='日本の伝統的な芸術には、茶道、華道、書道、能楽、歌舞伎などが含まれます。これらの芸術は日本文化の美意識や精神を表現する重要な要素です。', role='assistant', function_call=None, tool_calls=None)
```

### Fine-tuningの無いモデルを使用する

```python
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
  model="gpt-3.5-turbo-0125",
  messages=[
    {"role": "system", "content": "このチャットボットは日本文化に関する質問に答えます。"},
    {"role": "user", "content": "日本の伝統的な芸術について教えてください。"}
  ]
)
print(completion.choices[0].message)
```

**実行結果**

`gpt-3.5-turbo-0125` はFine-tuningされたモデルではないため、トレーニングファイル `mydata.jsonl` に含まれるデータを元にした回答が返ってきませんでした。

```python
ChatCompletionMessage(content='日本の伝統的な芸術には、以下のようなものがあります：\n\n1. 書道（しょどう）：漢字やひらがな、カタカナなどの文字を筆で書く芸術です。書道は文字を美しく表現することだけでなく、心の状態や作者の感情も表現されます。\n\n2. 茶道（さどう）：茶の湯とも呼ばれ、お茶を点てることやお点前の作法、茶室や茶道具の美しさなどが重要視される伝統的な習慣です。\n\n3. 能楽（のうがく）：能（のう）と狂言（きょうげん）を合わせた日本の伝統的な演劇形式で、歌舞伎のルーツともされています。\n\n4. 木版画（もくはんが）：浮世絵（うきよえ）とも呼ばれる日本の伝統的な木版画は、独特な色使いやデザインが特徴です。\n\n5. 陶芸（とうげい）：日本の陶芸は茶碗、花器、茶壷などの器や芸術作品が数多く作られており、日本独自の美意識が表現されています。\n\nこれらの伝統的な芸術は、日本文化や美意識を形成する重要な要素となっています。', role='assistant', function_call=None, tool_calls=None)
```
