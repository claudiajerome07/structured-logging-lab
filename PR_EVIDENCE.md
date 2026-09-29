# Structured logging evidence

## Before

The original app printed plain text lines such as:

```text
Payment started
connecting to db...
ok
Error!! something went wrong
retry
done maybe
```

These lines had no consistent fields, no severity level, and no `reqId`, so they were hard to trace during multi-request failures.

## After

The service now emits JSON logs like:

```json
{
  "ts": "2026-09-29T06:05:19.960Z",
  "level": "error",
  "service": "orders-api",
  "msg": "payment.failed",
  "reqId": "5e60441a-e020-4283-947c-915c89144951",
  "reason": "simulated dependency failure"
}
```

## Error filter

```bash
docker logs orders-api | jq 'select(.level=="error")'
```

Example output:

```json
{
  "ts": "2026-09-29T06:05:19.960Z",
  "level": "error",
  "service": "orders-api",
  "msg": "payment.failed",
  "reqId": "5e60441a-e020-4283-947c-915c89144951",
  "reason": "simulated dependency failure"
}
```

## Request trace

```bash
docker logs orders-api | jq 'select(.reqId=="5e60441a-e020-4283-947c-915c89144951")'
```

Example output:

```json
{"ts":"2026-09-29T06:05:19.947Z","level":"info","service":"orders-api","msg":"request.received","reqId":"5e60441a-e020-4283-947c-915c89144951","method":"GET","url":"/simulate-error"}
{"ts":"2026-09-29T06:05:19.960Z","level":"error","service":"orders-api","msg":"payment.failed","reqId":"5e60441a-e020-4283-947c-915c89144951","reason":"simulated dependency failure"}
{"ts":"2026-09-29T06:05:19.967Z","level":"info","service":"orders-api","msg":"request.completed","reqId":"5e60441a-e020-4283-947c-915c89144951","method":"GET","url":"/simulate-error","statusCode":500}
```

This proves the request ID traces the full story of one failing request end-to-end while the error filter isolates the real failure from the normal traffic.
