# Speech-to-Text: Hosted, Local and Fallback Strategy

## 1. Objective

Provide reliable speech recognition without making the whole system dependent on a single provider.

The architecture must support:

```text
Primary STT
   │
   ├── success → continue
   │
   └── failure
          │
          ▼
       fallback
          │
     ┌────┴────┐
     │         │
   success   failure
     │         │
     ▼         ▼
 continue    typed error
```

## 2. Provider interface

Define one internal contract:

```python
class SpeechRecognizer(Protocol):
    async def transcribe(self, audio: bytes) -> TranscriptionResult:
        ...
```

`TranscriptionResult` should contain at minimum:

```text
text
language
confidence if available
duration_ms
provider
model
request_id
```

## 3. Hosted STT

Use a hosted provider when:

- low-latency streaming is available
- infrastructure simplicity matters
- the application is network-connected
- provider quality is stronger for the target language/accent

Advantages:

- mature speech models
- streaming options
- no local model management
- lower local CPU/GPU requirements

Risks:

- network latency
- API outages
- rate limits
- cost
- privacy constraints

## 4. Local STT

Use a local Whisper-family or equivalent model when:

- offline operation matters
- privacy is important
- GPU/CPU resources are available
- deterministic infrastructure is preferred

Advantages:

- no external STT dependency
- predictable availability
- data stays local

Risks:

- model startup/warmup
- CPU/GPU latency
- memory usage
- potentially lower quality on difficult audio

## 5. Recommended V1 architecture

Implement both interfaces even if only one provider is initially configured.

```text
STTService
 ├── HostedSTT
 └── LocalSTT
```

Configuration:

```yaml
stt:
  primary: hosted
  fallback: local
  timeout_ms: 120
  max_retries: 1
```

Do not hard-code a provider in the pipeline.

## 6. Fallback policy

Fallback should not blindly retry forever.

Recommended policy:

### Retry the primary

Retry once only for transient failures:

- timeout
- temporary network failure
- 5xx provider error

Do not retry for:

- invalid audio
- unsupported format
- authentication failure
- invalid request

### Switch to fallback

Switch when:

- primary times out
- primary has a transient service failure
- primary returns an unusable transcription

### Do not fallback silently

Record:

```text
stt.provider.primary
stt.provider.actual
stt.fallback_used
stt.failure_reason
```

## 7. Audio validation

Before STT:

- validate MIME/type
- validate sample rate where required
- reject empty audio
- reject oversized payloads
- enforce maximum duration
- normalize audio only when necessary

## 8. Streaming

V2 should support partial transcription:

```text
audio chunk 1 → partial text
audio chunk 2 → partial text
audio chunk 3 → final text
```

The pipeline should not start expensive retrieval until the final query is stable, unless speculative retrieval is explicitly added later.

## 9. STT benchmark

Measure separately:

- transcription latency
- real-time factor
- word error rate if ground truth exists
- failure rate
- fallback rate

Do not combine STT quality and RAG quality into one score.

## 10. Important latency principle

If the challenge requires end-to-end latency under 200 ms, STT must be treated as a first-class latency budget.

Measure:

```text
audio capture
+ upload/network
+ STT
+ query processing
+ retrieval
+ reranking
+ generation
```

Never report only retrieval latency as "end-to-end voice latency."
