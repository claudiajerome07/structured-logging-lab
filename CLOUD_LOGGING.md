# Cloud logging mapping note

The service now emits structured JSON logs with consistent fields such as:

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

These are the same fields a cloud log backend indexes as searchable metadata:

- `ts` -> timestamp
- `level` -> severity
- `service` -> service name
- `msg` -> event name/message
- `reqId` -> correlation ID

## Google Cloud Logging

In Google Cloud Logging, this JSON payload is stored as structured log entries. You can filter with queries such as:

```text
severity="ERROR"
jsonPayload.level="error"
jsonPayload.reqId="5e60441a-e020-4283-947c-915c89144951"
```

This is the same idea as the local command:

```bash
docker logs orders-api | jq 'select(.level=="error")'
docker logs orders-api | jq 'select(.reqId=="5e60441a-e020-4283-947c-915c89144951")'
```

## Grafana Loki

Loki accepts JSON log payloads and indexes the fields as labels/structured data. The same request-scoped query becomes a field-based search rather than a blind text grep. Example patterns:

```text
{job="orders-api"} |= `"level":"error"`
{job="orders-api"} |= `"reqId":"5e60441a-e020-4283-947c-915c89144951"`
```

## Why this matters

Cloud log platforms are far easier to operate when the app writes consistent JSON. The service emits the same structure locally and in production, so debugging is the same workflow everywhere: filter by severity, then by request ID, then read the full story.
